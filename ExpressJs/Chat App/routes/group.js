// Import the Express library
const express = require("express");

// Create a new router object to define route handlers
const router = express.Router();

// Import middleware to verify JWT token for protected routes
const verifyToken = require("../middleware/verifyToken");

// Import group-related controller methods
const groupController = require("../controllers/groupController");


// ----------------------------------------
// GROUP ROUTES
// ----------------------------------------

/**
 * GET /groups
 * Get all groups the authenticated user belongs to
 */
router.get("/", verifyToken, groupController.groupsGET);

/**
 * POST /groups
 * Create a new group with the authenticated user as the admin
 */
router.post("/", verifyToken, groupController.groupsPOST);

/**
 * POST /groups/:groupId/invite
 * Invite another user (by username) to a specific group
 */
router.post("/:groupId/invite", verifyToken, groupController.groupinvitePOST);

// ----------------------------------------
// GROUP MESSAGE ROUTES
// ----------------------------------------

/**
 * GET /groups/:groupId/messages
 * Fetch all messages from a specific group
 */
router.get("/:groupId/messages", verifyToken, groupController.groupsmessageGET);

/**
 * POST /groups/:groupId/messages
 * Send a new message to a specific group
 */
router.post("/:groupId/messages", verifyToken, groupController.groupsmessagePOST);


// ----------------------------------------
// GROUP MEMBER ROUTES
// ----------------------------------------

/**
 * DELETE /groups/:groupId/members/:userId
 * Remove a specific user from a group (admin only)
 */
router.delete("/:groupId/members/:userId", verifyToken, groupController.groupmemberDELETE);


/**
 * GET /groups/:groupId/members
 * Get list of all members in a specific group
 */
router.get("/:groupId/members", verifyToken, groupController.groupmemberGET);


// ----------------------------------------
// EXPORT ROUTER
// ----------------------------------------

module.exports = router;
