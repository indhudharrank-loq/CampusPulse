const mongoose = require("mongoose");

const ClassLogSchema = new mongoose.Schema({

    teacherId: String,
    roomNumber: String,
    startTime: Date,
    endTime: Date

});

module.exports = mongoose.model("ClassLog", ClassLogSchema);