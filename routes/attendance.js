const express = require("express");
const router = express.Router();

const Attendance = require("../models/Attendance");

// MARK ATTENDANCE
router.post("/mark", async (req, res) => {

    const { teacherId, latitude, longitude, photo } = req.body;

    const attendance = new Attendance({
        teacherId,
        latitude,
        longitude,
        photo,
        loginTime: new Date()
    });

    await attendance.save();

    res.json({ success: true, message: "Attendance Marked" });
});

// LOGOUT (ADD THIS BACK)
router.post("/logout", async (req, res) => {

    const { teacherId } = req.body;

    const attendance = await Attendance.findOne({ teacherId }).sort({ loginTime: -1 });

    if (attendance) {
        attendance.logoutTime = new Date();
        await attendance.save();

        res.json({ success: true, message: "Logged out successfully" });
    } else {
        res.json({ success: false, message: "No attendance found" });
    }

});

// GET ALL (FOR PRINCIPAL)
router.get("/all", async (req, res) => {

    const data = await Attendance.find().sort({ loginTime: -1 });

    res.json(data);

});

module.exports = router;