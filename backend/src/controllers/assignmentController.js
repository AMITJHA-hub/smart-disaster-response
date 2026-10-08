const VolunteerAssignment = require("../models/VolunteerAssignment");
const Emergency = require("../models/Emergency");
const Volunteer = require("../models/Volunteer");

const assignVolunteer = async (req, res) => {
    try {
        const { emergencyId, volunteerId } = req.body;

        if (!emergencyId || !volunteerId) {
            return res.status(400).json({
                message: "Emergency ID and Volunteer ID are required"
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
                message: "Only verified emergencies can have volunteers assigned"
            });
        }

        const volunteer = await Volunteer.findById(volunteerId);

        if (!volunteer) {
            return res.status(404).json({
                message: "Volunteer not found"
            });
        }

        if (!volunteer.availability) {
            return res.status(400).json({
                message: "Volunteer is currently unavailable"
            });
        }

        const existingAssignment = await VolunteerAssignment.findOne({
            emergency: emergencyId,
            volunteer: volunteerId,
            status: { $ne: "Cancelled" }
        });

        if (existingAssignment) {
            return res.status(400).json({
                message: "Volunteer is already assigned to this emergency"
            });
        }

        const assignment = await VolunteerAssignment.create({
            emergency: emergencyId,
            volunteer: volunteerId,
            assignedBy: req.user.userId
        });

        res.status(201).json({
            message: "Volunteer assigned successfully",
            assignment
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to assign volunteer"
        });
    }
};
const updateAssignmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        const allowedStatuses = [
            "In Progress",
            "Completed",
            "Cancelled"
        ];

        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid assignment status"
            });
        }

        const assignment = await VolunteerAssignment.findById(id);

        if (!assignment) {
            return res.status(404).json({
                message: "Assignment not found"
            });
        }

        const volunteer = await Volunteer.findOne({
            _id: assignment.volunteer,
            user: req.user.userId
        });

        if (!volunteer) {
            return res.status(403).json({
                message: "You are not authorized to update this assignment"
            });
        }

        if (assignment.status === "Completed") {
            return res.status(400).json({
                message: "Completed assignments cannot be updated"
            });
        }

        if (assignment.status === "Cancelled") {
            return res.status(400).json({
                message: "Cancelled assignments cannot be updated"
            });
        }

        if (
            assignment.status === "Assigned" &&
            status !== "In Progress" &&
            status !== "Cancelled"
        ) {
            return res.status(400).json({
                message: "Assigned tasks can only move to In Progress or Cancelled"
            });
        }

        if (
            assignment.status === "In Progress" &&
            status !== "Completed" &&
            status !== "Cancelled"
        ) {
            return res.status(400).json({
                message: "In Progress tasks can only move to Completed or Cancelled"
            });
        }

        assignment.status = status;

        await assignment.save();

        res.status(200).json({
            message: "Assignment status updated successfully",
            assignment
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update assignment status"
        });
    }
};

const getMyAssignments = async (req, res) => {
    try {
        const volunteer = await Volunteer.findOne({ user: req.user.userId });
        if (!volunteer) {
            return res.status(404).json({ message: "Volunteer profile not found" });
        }

        const assignments = await VolunteerAssignment.find({ volunteer: volunteer._id })
            .populate("emergency")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Assignments fetched successfully",
            assignments
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch assignments" });
    }
};

const getAllAssignments = async (req, res) => {
    try {
        const assignments = await VolunteerAssignment.find()
            .populate("emergency")
            .populate({
                path: "volunteer",
                populate: { path: "user", select: "name email phone" }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Assignments fetched successfully",
            assignments
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch assignments" });
    }
};

module.exports = {
    assignVolunteer,
    updateAssignmentStatus,
    getMyAssignments,
    getAllAssignments
};