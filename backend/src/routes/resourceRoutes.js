const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
    addEmergencyResource,
    getEmergencyResources,
    updateEmergencyResource,
    getAllResources
} = require("../controllers/resourceController");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    authorizeRoles("Administrator"),
    addEmergencyResource
);

router.get(
    "/all",
    authMiddleware,
    authorizeRoles("Administrator"),
    getAllResources
);

router.get(
    "/:emergencyId",
    authMiddleware,
    getEmergencyResources
);

router.patch(
    "/:id",
    authMiddleware,
    authorizeRoles("Administrator"),
    updateEmergencyResource
);

module.exports = router;