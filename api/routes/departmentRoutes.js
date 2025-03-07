const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { authenticateToken, authorizeAdmin } = require("../middleware/auth");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get departments (with organization filter)
router.get("/", async (req, res) => {
  try {
    const { organizationId } = req.query;
    const departments = await prisma.department.findMany({
      where: {
        organizationId: organizationId || undefined,
      },
      include: {
        head: true,
        parentDepartment: true,
        members: true,
        organization: true,
        _count: {
          select: {
            members: true,
            subDepartments: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: departments,
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching departments",
    });
  }
});

// Get department hierarchy
router.get("/hierarchy", async (req, res) => {
  try {
    const { organizationId } = req.query;
    const departments = await prisma.department.findMany({
      where: {
        organizationId: organizationId || undefined,
        parentId: null, // Get root departments
      },
      include: {
        head: true,
        members: true,
        subDepartments: {
          include: {
            head: true,
            members: true,
            subDepartments: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: departments,
    });
  } catch (error) {
    console.error("Error fetching department hierarchy:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching department hierarchy",
    });
  }
});

// Create department
router.post("/", authorizeAdmin, async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      headId,
      parentId,
      location,
      organizationId,
    } = req.body;

    // Check if department code exists in the organization
    const existingDept = await prisma.department.findFirst({
      where: {
        code,
        organizationId,
      },
    });

    if (existingDept) {
      return res.status(400).json({
        success: false,
        message: "Department with this code already exists in the organization",
      });
    }

    const department = await prisma.department.create({
      data: {
        name,
        code,
        description,
        headId,
        parentId,
        location,
        organizationId,
      },
    });

    res.status(201).json({
      success: true,
      data: department,
      message: "Department created successfully",
    });
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).json({
      success: false,
      message: "Error creating department",
    });
  }
});

// Update department
router.put("/:id", authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      code,
      description,
      headId,
      parentId,
      location,
      isActive,
      organizationId,
    } = req.body;

    const department = await prisma.department.update({
      where: { id },
      data: {
        name,
        code,
        description,
        headId,
        parentId,
        location,
        isActive,
        organizationId,
      },
    });

    res.json({
      success: true,
      data: department,
      message: "Department updated successfully",
    });
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({
      success: false,
      message: "Error updating department",
    });
  }
});

// Delete department
router.delete("/:id", authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if department has members or sub-departments
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            members: true,
            subDepartments: true,
          },
        },
      },
    });

    if (department._count.members > 0 || department._count.subDepartments > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete department with members or sub-departments",
      });
    }

    await prisma.department.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting department",
    });
  }
});

module.exports = router;
