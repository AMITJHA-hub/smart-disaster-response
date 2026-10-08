const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
    createDonationPledge,
    getEmergencyDonationPledges,
    getMyDonationPledges,
    getAllDonationPledges,
    verifyDonationPledge
} = require("../controllers/donationController");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    authorizeRoles("Donor"),
    createDonationPledge
);

router.get(
    "/my",
    authMiddleware,
    authorizeRoles("Donor"),
    getMyDonationPledges
);

router.get(
    "/all",
    authMiddleware,
    authorizeRoles("Administrator"),
    getAllDonationPledges
);

router.get(
    "/emergency/:emergencyId",
    authMiddleware,
    authorizeRoles("Administrator", "Donor"),
    getEmergencyDonationPledges
);

router.patch(
    "/:id/verify",
    authMiddleware,
    authorizeRoles("Administrator"),
    verifyDonationPledge
);

module.exports = router;