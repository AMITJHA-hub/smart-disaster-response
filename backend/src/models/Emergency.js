const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema(
    {
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        image: {
            type: String,
            default: null
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Verified",
                "Ongoing",
                "Resolved",
                "Rejected"
            ],
            default: "Pending"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Emergency", emergencySchema);