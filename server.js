const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// DB CONNECT
mongoose.connect("mongodb://127.0.0.1:27017/campusPulse")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));


// =====================
// 📌 GLOBAL DATA (ADD THIS)
// =====================

const subjects = [
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "Kannada",
    "Hindi"
];

const days = ["Monday","Tuesday","Wednesday","Thursday","Friday"];

const rooms = [
    "Class 5",
    "Class 6",
    "Class 7",
    "Class 8",
    "Class 9",
    "Class 10"
];


// =====================
// PRINCIPAL SETUP
// =====================

const Principal = require("./models/Principal");

async function addPrincipal(){

    const exists = await Principal.findOne({ username: "admin" });

    if(!exists){
        await Principal.create({
            username: "admin",
            password: "admin123"
        });
        console.log("Principal Added");
    }

}

addPrincipal();


// =====================
// TEACHER SETUP
// =====================

const Teacher = require("./models/Teacher");

// 🔁 GENERAL SCHEDULE
function generateSchedule(subjects, days, rooms, teacherIndex){

    let schedule = [];

    // Timetable structure
    const periods = [
        { period: 1, time: "9:00 AM - 10:00 AM" },
        { period: 2, time: "10:00 AM - 11:00 AM" },
        { period: 3, time: "11:00 AM - 12:00 PM" },

        // Lunch
        { period: "Lunch", time: "12:00 PM - 1:00 PM", subject: "Break" },

        { period: 4, time: "1:00 PM - 2:00 PM" },
        { period: 5, time: "2:00 PM - 3:00 PM" }
    ];

    days.forEach(day => {

        // Random FREE period (1 to 5 only)
        let freePeriod = Math.floor(Math.random() * 5) + 1;

        periods.forEach((p, i) => {

            // Lunch Break
            if(p.period === "Lunch"){

                schedule.push({
                    day,
                    period: p.period,
                    time: p.time,
                    subject: "Break",
                    room: "-"
                });

                return;
            }

            // FREE PERIOD
            if(p.period === freePeriod){

                schedule.push({
                    day,
                    period: p.period,
                    time: p.time,
                    subject: "FREE",
                    room: "-"
                });

                return;
            }

            // Normal Subject
            let subjectIndex = (i + teacherIndex) % subjects.length;
         let roomIndex =
    ((teacherIndex + i + days.indexOf(day))
    % rooms.length);

            schedule.push({
                day,
                period: p.period,
                time: p.time,
                subject: subjects[subjectIndex],
                room: rooms[roomIndex]
            });

        });

    });

    return schedule;
}

// ➕ MATH TEACHER CUSTOM
function generateMathSchedule(days, rooms, teacherIndex){

    let schedule = [];

    days.forEach(day => {

        for(let i = 0; i < 3; i++){

            let roomIndex = (i + teacherIndex) % rooms.length;

            schedule.push({
                day,
                subject: "Math",
                room: rooms[roomIndex],
                time: `${9 + i}:00 AM`
            });

        }

    });

    return schedule;
}


// =====================
// ADD TEACHERS
// =====================

async function addTeacher(){

    // T001
    const exists1 = await Teacher.findOne({ teacherId: "T001" });

    if(!exists1){
        await Teacher.create({
            teacherId: "T001",
            name: "John",
            password: "1234",
            department: "Science",
            schedule: generateSchedule(
    ["Physics", "Chemistry", "Biology"],
    days, rooms, 0
)
        });

        console.log("T001 Added");
    }

    // T002
    const exists2 = await Teacher.findOne({ teacherId: "T002" });

    if(!exists2){
        await Teacher.create({
            teacherId: "T002",
            name: "Roshan",
            password: "1234",
            department: "Languages",
            schedule: generateSchedule(
    ["English", "Hindi", "Kannada"],
    days, rooms, 1
)
        });

        console.log("T002 Added");
    }

    // T003
    const exists3 = await Teacher.findOne({ teacherId: "T003" });

    if(!exists3){
        await Teacher.create({
            teacherId: "T003",
            name: "Arjun",
            password: "1234",
            department: "Social",
          schedule: generateSchedule(
    ["Civics", "History", "Geography"],
    days, rooms, 2
)
        });

        console.log("T003 Added");
    }

    // T004 (Math)
    const exists4 = await Teacher.findOne({ teacherId: "T004" });

    if(!exists4){
        await Teacher.create({
            teacherId: "T004",
            name: "Rahul",
            password: "1234",
            department: "Mathematics",
            schedule: generateMathSchedule(
                ["Thursday","Friday","Saturday"],
                rooms,
                3
            )
        });

        console.log("T004 Added");
    }


    const exists5 = await Teacher.findOne({ teacherId: "T005" });

    if(!exists5){
        await Teacher.create({
            teacherId: "T005",
            name: "Aravind",
            password: "1234",
            department: "Games",
                  schedule: generateSchedule(
    ["Games", "Games", "Games"],
    days, rooms, 4
            )
        });

        console.log("T005 Added");
    }

    


    
} 

addTeacher();


// =====================
// ROUTES
// =====================

console.log("Server file running...");

const teacherRoutes = require("./routes/teacher2");
app.use("/teacher", teacherRoutes);

const authRoutes = require("./routes/auth");
app.use("/api", authRoutes);

const attendanceRoutes = require("./routes/attendance");
app.use("/api/attendance", attendanceRoutes);

const classRoutes = require("./routes/class");
app.use("/api/class", classRoutes);





// =====================
// END OF DAY
// =====================

app.post("/api/end-day", async (req, res) => {

    try{

        const Attendance = require("./models/Attendance");
        const ClassLog = require("./models/ClassLog");

        let now = new Date();

        await Attendance.updateMany(
            { logoutTime: null },
            { $set: { logoutTime: now } }
        );

        await ClassLog.updateMany(
            { endTime: null },
            { $set: { endTime: now } }
        );

        res.json({ success: true, message: "End of Day completed" });

    }catch(err){
        res.status(500).json({ success:false });
    }

});
app.get("/api/all-schedules", async (req, res) => {
    try {
        const Teacher = require("./models/Teacher");

        let teachers = await Teacher.find();

        res.json(teachers);

    } catch (err) {
        res.status(500).json({ error: "Failed to load schedules" });
    }
});

app.get("/api/stats", async (req, res) => {
    try {
        const Teacher = require("./models/Teacher");
        const Attendance = require("./models/Attendance");
        const ClassLog = require("./models/ClassLog");

        let totalTeachers = await Teacher.countDocuments();

        let activeClasses = await ClassLog.countDocuments({
            endTime: null
        });

        let today = new Date().toDateString();

        let attendance = await Attendance.find();
        let todayAttendance = attendance.filter(a =>
            new Date(a.loginTime).toDateString() === today
        );

        res.json({
            totalTeachers,
            activeClasses,
            attendanceMarked: todayAttendance.length
        });

    } catch (err) {
        res.status(500).json({ error: "Failed to load stats" });
    }
});


// TEST
app.get("/", (req, res) => {
    res.send("CampusPulse Server Running");
});

app.listen(4000, () => {
    console.log("Server running on port 4000");
});