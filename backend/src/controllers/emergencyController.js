const Emergency = require("../models/Emergency");

const createEmergency = async (req, res) => {
    try {
        const {
            category,
            description,
            location,
            image
        } = req.body;

        if (!category || !description || !location) {
            return res.status(400).json({
                message: "Category, description and location are required"
            });
        }

        const emergency = await Emergency.create({
            reportedBy: req.user.userId,
            category,
            description,
            location,
            image: image || null
        });

        res.status(201).json({
            message: "Emergency reported successfully",
            emergency
        });

    } catch (error) {
        console.error("Create emergency error:", error);

        res.status(500).json({
            message: "Failed to report emergency"
        });
    }
};
const getMyEmergencies = async (req, res) => {
    try {
        const emergencies = await Emergency.find({
            reportedBy: req.user.userId
        }).sort({ createdAt: -1 });

        res.status(200).json({
            message: "Emergencies fetched successfully",
            emergencies
        });

    } catch (error) {
        console.error("Get my emergencies error:", error);

        res.status(500).json({
            message: "Failed to fetch emergencies"
        });
    }
};
const getAllEmergencies = async (req, res) => {
    try {
        const emergencies = await Emergency.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "All emergencies fetched successfully",
            emergencies
        });

    } catch (error) {
        console.error("Get all emergencies error:", error);

        res.status(500).json({
            message: "Failed to fetch emergencies"
        });
    }
};
const updateEmergencyStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "Verified",
            "Ongoing",
            "Resolved",
            "Rejected"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid emergency status"
            });
        }

        const emergency = await Emergency.findById(id);

        if (!emergency) {
            return res.status(404).json({
                message: "Emergency not found"
            });
        }

        const currentStatus = emergency.status;

        const validTransitions = {
            Pending: ["Verified", "Rejected"],
            Verified: ["Ongoing"],
            Ongoing: ["Resolved"],
            Resolved: [],
            Rejected: []
        };

        if (!validTransitions[currentStatus].includes(status)) {
            return res.status(400).json({
                message: `Emergency cannot be changed from ${currentStatus} to ${status}`
            });
        }

        emergency.status = status;

        await emergency.save();

        return res.status(200).json({
            message: "Emergency status updated successfully",
            emergency
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};
module.exports = {
    createEmergency,
    getMyEmergencies,
    getAllEmergencies,
    updateEmergencyStatus
};