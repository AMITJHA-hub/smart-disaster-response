const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
    createDonationPledge,
    getEmergencyDonationPledges
} = require("../controllers/donationController");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    authorizeRoles("Donor"),
    createDonationPledge
);

router.get(
    "/emergency/:emergencyId",
    authMiddleware,
    authorizeRoles("Administrator", "Donor"),
    getEmergencyDonationPledges
);

module.exports = router;