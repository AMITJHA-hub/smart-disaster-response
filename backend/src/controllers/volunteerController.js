const Volunteer = require("../models/Volunteer");

const createVolunteerProfile = async (req, res) => {
    try {
        const { skills, availability, area } = req.body;

        if (!area) {
            return res.status(400).json({
                message: "Area is required"
            });
        }

        const existingVolunteer = await Volunteer.findOne({
            user: req.user.userId
        });

        if (existingVolunteer) {
            return res.status(400).json({
                message: "Volunteer profile already exists"
            });
        }

        const volunteer = await Volunteer.create({
            user: req.user.userId,
            skills: skills || [],
            availability: availability ?? true,
            area
        });

        res.status(201).json({
            message: "Volunteer profile created successfully",
            volunteer
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create volunteer profile"
        });
    }
};
const getMyVolunteerProfile = async (req, res) => {
    try {
        const volunteer = await Volunteer.findOne({
            user: req.user.userId
        }).populate("user", "-password");

        if (!volunteer) {
            return res.status(404).json({
                message: "Volunteer profile not found"
            });
        }

        res.status(200).json({
            message: "Volunteer profile fetched successfully",
            volunteer
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch volunteer profile"
        });
    }
};
const updateMyVolunteerProfile = async (req, res) => {
    try {
        const { skills, availability, area } = req.body;

        const volunteer = await Volunteer.findOne({
            user: req.user.userId
        });

        if (!volunteer) {
            return res.status(404).json({
                message: "Volunteer profile not found"
            });
        }

        if (skills !== undefined) {
            volunteer.skills = skills;
        }

        if (availability !== undefined) {
            volunteer.availability = availability;
        }

        if (area !== undefined) {
            volunteer.area = area;
        }

        await volunteer.save();

        res.status(200).json({
            message: "Volunteer profile updated successfully",
            volunteer
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update volunteer profile"
        });
    }
};
const getVolunteers = async (req, res) => {
    try {
        const { area, skills, availability } = req.query;

        const filter = {};

        if (area) {
            filter.area = area;
        }

        if (skills) {
            filter.skills = skills;
        }

        if (availability !== undefined) {
            filter.availability = availability === "true";
        }

        const volunteers = await Volunteer.find(filter)
            .populate("user", "-password");

        res.status(200).json({
            message: "Volunteers fetched successfully",
            count: volunteers.length,
            volunteers
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch volunteers"
        });
    }
};
module.exports = {
    createVolunteerProfile,
    getMyVolunteerProfile,
    updateMyVolunteerProfile,
    getVolunteers
};