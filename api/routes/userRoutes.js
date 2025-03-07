const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { authenticateToken, authorizeAdmin } = require("../middleware/auth");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get users (with organization filter)
router.get("/", async (req, res) => {
  try {
    const { organizationId } = req.query;
    const users = await prisma.user.findMany({
      where: {
        organizationId: organizationId || undefined,
      },
      include: {
        department: true,
        reportsTo: true,
        organization: true,
      },
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
    });
  }
});

// Create user
router.post("/", authorizeAdmin, async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      role,
      departmentId,
      reportsToId,
      organizationId,
    } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password, // Note: In production, hash the password before saving
        name,
        role,
        departmentId,
        reportsToId,
        organizationId,
      },
    });

    res.status(201).json({
      success: true,
      data: user,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user",
    });
  }
});

// Update user
router.put("/:id", authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      email,
      name,
      role,
      departmentId,
      reportsToId,
      isActive,
      organizationId,
    } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        email,
        name,
        role,
        departmentId,
        reportsToId,
        isActive,
        organizationId,
      },
    });

    res.json({
      success: true,
      data: user,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user",
    });
  }
});

// Delete user
router.delete("/:id", authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
    });
  }
});

module.exports = router;
