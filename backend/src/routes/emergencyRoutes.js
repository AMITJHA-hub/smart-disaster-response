const express = require("express");

const {
    createEmergency,
    getMyEmergencies,
    getAllEmergencies,
    updateEmergencyStatus
} = require("../controllers/emergencyController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    authorizeRoles("Citizen"),
    createEmergency
);

router.get(
    "/my",
    authMiddleware,
    authorizeRoles("Citizen"),
    getMyEmergencies
);

router.get(
    "/",
    authMiddleware,
    authorizeRoles("Administrator", "Volunteer", "Emergency_Personnel"),
    getAllEmergencies
);
router.patch(
    "/:id/status",
    authMiddleware,
    authorizeRoles("Administrator"),
    updateEmergencyStatus
);
module.exports = router;