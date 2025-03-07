const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create organization
exports.createOrganization = async (req, res) => {
  try {
    const { name, code, address, phone, email, website, description } =
      req.body;

    // Check if organization with same code exists
    const existingOrg = await prisma.organisation.findUnique({
      where: { code },
    });

    if (existingOrg) {
      return res.status(400).json({
        success: false,
        message: "Organization with this code already exists",
      });
    }

    const organization = await prisma.organisation.create({
      data: {
        name,
        code,
        address,
        phone,
        email,
        website,
        description,
      },
    });

    res.status(201).json({
      success: true,
      data: organization,
      message: "Organization created successfully",
    });
  } catch (error) {
    console.error("Error creating organization:", error);
    res.status(500).json({
      success: false,
      message: "Error creating organization",
    });
  }
};

// Get all organizations
exports.getOrganizations = async (req, res) => {
  try {
    const organizations = await prisma.organisation.findMany({
      include: {
        _count: {
          select: {
            departments: true,
            users: true,
            admins: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: organizations,
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching organizations",
    });
  }
};

// Get organization by ID
exports.getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;

    const organization = await prisma.organisation.findUnique({
      where: { id },
      include: {
        departments: true,
        users: true,
        admins: true,
        _count: {
          select: {
            departments: true,
            users: true,
            admins: true,
          },
        },
      },
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    res.status(200).json({
      success: true,
      data: organization,
    });
  } catch (error) {
    console.error("Error fetching organization:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching organization",
    });
  }
};

// Update organization
exports.updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      code,
      address,
      phone,
      email,
      website,
      description,
      isActive,
    } = req.body;

    // Check if organization exists
    const existingOrg = await prisma.organisation.findUnique({
      where: { id },
    });

    if (!existingOrg) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Check if new code conflicts with existing organization
    if (code !== existingOrg.code) {
      const codeExists = await prisma.organisation.findUnique({
        where: { code },
      });

      if (codeExists) {
        return res.status(400).json({
          success: false,
          message: "Organization with this code already exists",
        });
      }
    }

    const organization = await prisma.organisation.update({
      where: { id },
      data: {
        name,
        code,
        address,
        phone,
        email,
        website,
        description,
        isActive,
      },
    });

    res.status(200).json({
      success: true,
      data: organization,
      message: "Organization updated successfully",
    });
  } catch (error) {
    console.error("Error updating organization:", error);
    res.status(500).json({
      success: false,
      message: "Error updating organization",
    });
  }
};

// Delete organization
exports.deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if organization exists
    const existingOrg = await prisma.organisation.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            departments: true,
            users: true,
            admins: true,
          },
        },
      },
    });

    if (!existingOrg) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Check if organization has associated data
    if (
      existingOrg._count.departments > 0 ||
      existingOrg._count.users > 0 ||
      existingOrg._count.admins > 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete organization with associated departments, users, or admins",
      });
    }

    await prisma.organisation.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Organization deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting organization:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting organization",
    });
  }
};
