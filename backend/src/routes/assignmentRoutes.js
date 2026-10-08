const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
    assignVolunteer,
    updateAssignmentStatus,
    getMyAssignments,
    getAllAssignments
} = require("../controllers/assignmentController");

const router = express.Router();

router.get(
    "/me",
    authMiddleware,
    authorizeRoles("Volunteer"),
    getMyAssignments
);

router.get(
    "/",
    authMiddleware,
    authorizeRoles("Administrator"),
    getAllAssignments
);

router.post(
    "/",
    authMiddleware,
    authorizeRoles("Administrator"),
    assignVolunteer
);

router.patch(
    "/:id/status",
    authMiddleware,
    authorizeRoles("Volunteer"),
    updateAssignmentStatus
);

module.exports = router;