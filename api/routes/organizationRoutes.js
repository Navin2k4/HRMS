const express = require("express");
const router = express.Router();
const organizationController = require("../controllers/organizationController");
const { authenticateToken, authorizeAdmin } = require("../middleware/auth");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Apply admin authorization to all routes
router.use(authorizeAdmin);

// Create organization - Super Admin only
router.post("/", organizationController.createOrganization);

// Get all organizations
router.get("/", organizationController.getOrganizations);

// Get organization by ID
router.get("/:id", organizationController.getOrganizationById);

// Update organization
router.put("/:id", organizationController.updateOrganization);

// Delete organization
router.delete("/:id", organizationController.deleteOrganization);

module.exports = router;
