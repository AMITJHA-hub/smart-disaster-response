const mongoose = require("mongoose");

const donationPledgeSchema = new mongoose.Schema(
    {
        donor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        emergency: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Emergency",
            required: true
        },

        donationType: {
            type: String,
            required: true,
            trim: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        status: {
            type: String,
            enum: ["Pending", "Accepted", "Fulfilled", "Cancelled"],
            default: "Pending"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "DonationPledge",
    donationPledgeSchema
);