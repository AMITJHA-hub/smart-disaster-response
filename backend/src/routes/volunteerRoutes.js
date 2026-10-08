const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
    createVolunteerProfile,
    getMyVolunteerProfile,
    updateMyVolunteerProfile,
    getVolunteers
} = require("../controllers/volunteerController");

const router = express.Router();

router.get(
    "/me",
    authMiddleware,
    authorizeRoles("Volunteer"),
    getMyVolunteerProfile
);
router.post(
    "/",
    authMiddleware,
    authorizeRoles("Volunteer"),
    createVolunteerProfile
);
router.patch(
    "/me",
    authMiddleware,
    authorizeRoles("Volunteer"),
    updateMyVolunteerProfile
);
router.get(
    "/",
    authMiddleware,
    authorizeRoles("Administrator"),
    getVolunteers
);

module.exports = router;