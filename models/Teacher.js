const mongoose = require("mongoose");

const TeacherSchema = new mongoose.Schema({

    teacherId: String,
    name: String,
    password: String,
    department: String,

      schedule: [
        {
            day: String,
            subject: String,
            room: String,
            time: String
        }
    ]

});



module.exports = mongoose.model("Teacher", TeacherSchema);