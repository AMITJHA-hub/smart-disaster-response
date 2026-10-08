const express = require("express");
const mongoose = require("mongoose");

const cors = require("cors");
const authRoutes = require("./src/routes/authRoutes");
const emergencyRoutes = require("./src/routes/emergencyRoutes");
const volunteerRoutes = require("./src/routes/volunteerRoutes");
const assignmentRoutes = require("./src/routes/assignmentRoutes");
const resourceRoutes = require("./src/routes/resourceRoutes");
const donationRoutes = require("./src/routes/donationRoutes");
const aiRoutes = require("./src/routes/aiRoutes");

require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/emergencies", emergencyRoutes);
app.use("/api/v1/volunteers", volunteerRoutes);
app.use("/api/v1/assignments", assignmentRoutes);
app.use("/api/v1/emergency-resources", resourceRoutes);
app.use("/api/v1/donations", donationRoutes);
app.use("/api/v1/ai", aiRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Smart Disaster Response API is running"
    });
});

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
    });