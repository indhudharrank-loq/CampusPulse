const express = require("express");
const router = express.Router();

const ClassLog = require("../models/ClassLog");

// START CLASS
router.post("/start", async (req, res) => {

    const { teacherId, roomNumber } = req.body;

    const newClass = new ClassLog({
        teacherId,
        roomNumber,
        startTime: new Date()
    });

    await newClass.save();

    res.json({ success: true, message: "Class Started" });

});

// END CLASS
router.post("/end", async (req, res) => {

    const { teacherId, roomNumber } = req.body;

    const classData = await ClassLog.findOne({ teacherId, roomNumber, endTime: null }).sort({ startTime: -1 });

    if (classData) {
        classData.endTime = new Date();
        await classData.save();

        res.json({ success: true, message: "Class Ended" });
    } else {
        res.json({ success: false, message: "No active class found" });
    }

});
router.get("/all", async (req, res) => {

    const data = await ClassLog.find().sort({ startTime: -1 });

    res.json(data);

});

module.exports = router;