const Emergency = require("../models/Emergency");
const EmergencyResource = require("../models/EmergencyResource");

const addEmergencyResource = async (req, res) => {
    try {
        const { emergencyId, resourceName, quantityRequired } = req.body;

        if (!emergencyId || !resourceName || !quantityRequired) {
            return res.status(400).json({
                message: "Emergency ID, resource name and quantity required are required"
            });
        }

        const emergency = await Emergency.findById(emergencyId);

        if (!emergency) {
            return res.status(404).json({
                message: "Emergency not found"
            });
        }

        if (emergency.status !== "Verified") {
            return res.status(400).json({
                message: "Resources can only be added to verified emergencies"
            });
        }

        const resource = await EmergencyResource.create({
            emergency: emergencyId,
            resourceName,
            quantityRequired,
            addedBy: req.user.userId
        });

        return res.status(201).json({
            message: "Emergency resource added successfully",
            resource
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};
const getEmergencyResources = async (req, res) => {
    try {
        const { emergencyId } = req.params;

        const emergency = await Emergency.findById(emergencyId);

        if (!emergency) {
            return res.status(404).json({
                message: "Emergency not found"
            });
        }

        const resources = await EmergencyResource.find({
            emergency: emergencyId
        });

        return res.status(200).json({
            message: "Emergency resources retrieved successfully",
            resources
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};
const updateEmergencyResource = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantityReceived } = req.body;

        if (quantityReceived === undefined) {
            return res.status(400).json({
                message: "Quantity received is required"
            });
        }

        if (quantityReceived < 0) {
            return res.status(400).json({
                message: "Quantity received cannot be negative"
            });
        }

        const resource = await EmergencyResource.findById(id);

        if (!resource) {
            return res.status(404).json({
                message: "Emergency resource not found"
            });
        }

        if (resource.status === "Fulfilled") {
            return res.status(400).json({
                message: "Fulfilled resources cannot be updated"
            });
        }

        if (quantityReceived > resource.quantityRequired) {
            return res.status(400).json({
                message: "Quantity received cannot exceed quantity required"
            });
        }

        resource.quantityReceived = quantityReceived;

        if (quantityReceived === 0) {
            resource.status = "Pending";
        } else if (quantityReceived < resource.quantityRequired) {
            resource.status = "Partially Fulfilled";
        } else {
            resource.status = "Fulfilled";
        }

        await resource.save();

        return res.status(200).json({
            message: "Emergency resource updated successfully",
            resource
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};
const getAllResources = async (req, res) => {
    try {
        const resources = await EmergencyResource.find().populate('emergency', 'category location');
        return res.status(200).json({
            message: "All emergency resources retrieved successfully",
            resources
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    addEmergencyResource,
    getEmergencyResources,
    updateEmergencyResource,
    getAllResources
};