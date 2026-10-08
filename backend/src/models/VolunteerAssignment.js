const mongoose = require("mongoose");

const volunteerAssignmentSchema = new mongoose.Schema(
    {
        emergency: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Emergency",
            required: true
        },

        volunteer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Volunteer",
            required: true
        },

        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: ["Assigned", "In Progress", "Completed", "Cancelled"],
            default: "Assigned"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "VolunteerAssignment",
    volunteerAssignmentSchema
);