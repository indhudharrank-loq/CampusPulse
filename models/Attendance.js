const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({

    teacherId: String,
    loginTime: Date,
    logoutTime: Date,
    latitude: Number,
    longitude: Number,
    photo: String

});

module.exports = mongoose.model("Attendance", AttendanceSchema);