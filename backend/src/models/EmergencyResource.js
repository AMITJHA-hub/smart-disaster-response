const mongoose = require("mongoose");

const emergencyResourceSchema = new mongoose.Schema(
    {
        emergency: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Emergency",
            required: true
        },

        resourceName: {
            type: String,
            required: true,
            trim: true
        },

        quantityRequired: {
            type: Number,
            required: true,
            min: 1
        },

        quantityReceived: {
            type: Number,
            default: 0,
            min: 0
        },

        status: {
            type: String,
            enum: ["Pending", "Partially Fulfilled", "Fulfilled"],
            default: "Pending"
        },

        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "EmergencyResource",
    emergencyResourceSchema
);