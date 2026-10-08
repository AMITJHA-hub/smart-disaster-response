const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
    assignVolunteer,
    updateAssignmentStatus
} = require("../controllers/assignmentController");

const router = express.Router();

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