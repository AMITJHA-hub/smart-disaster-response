const Emergency = require("../models/Emergency");
const DonationPledge = require("../models/DonationPledge");

const createDonationPledge = async (req, res) => {
    try {
        const { emergencyId, donationType, quantity } = req.body;

        if (!emergencyId || !donationType || quantity === undefined) {
            return res.status(400).json({
                message: "Emergency ID, donation type and quantity are required"
            });
        }

        if (quantity < 1) {
            return res.status(400).json({
                message: "Quantity must be at least 1"
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
                message: "Donations can only be pledged to verified emergencies"
            });
        }

        const pledge = await DonationPledge.create({
            donor: req.user.userId,
            emergency: emergencyId,
            donationType,
            quantity
        });

        return res.status(201).json({
            message: "Donation pledge created successfully",
            pledge
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};
const getEmergencyDonationPledges = async (req, res) => {
    try {
        const { emergencyId } = req.params;

        const emergency = await Emergency.findById(emergencyId);

        if (!emergency) {
            return res.status(404).json({
                message: "Emergency not found"
            });
        }

        const query = {
            emergency: emergencyId
        };

        if (req.user.role === "Donor") {
            query.donor = req.user.userId;
        }

        const pledges = await DonationPledge.find(query);

        return res.status(200).json({
            message: "Donation pledges retrieved successfully",
            pledges
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};
module.exports = {
    createDonationPledge,
    getEmergencyDonationPledges
};