const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        skills: {
            type: [String],
            default: []
        },

        availability: {
            type: Boolean,
            default: true
        },

        area: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Volunteer", volunteerSchema);