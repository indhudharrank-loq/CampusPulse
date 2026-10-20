console.log("Teacher2 route loaded");

const express = require("express");
const router = express.Router();

const Teacher = require("../models/Teacher");


// ==============================
// GET ALL TEACHERS
// ==============================

router.get("/all-teachers", async (req, res) => {

    try{

        const teachers = await Teacher.find();

        res.json(teachers);

    }catch(err){

        res.status(500).json({
            success:false,
            message:"Error fetching teachers"
        });

    }

});


// ==============================
// TEST ROUTE
// ==============================

router.get("/test", (req, res) => {
    res.send("Teacher route working");
});


// ==============================
// ADD NEW TEACHER
// ==============================

router.post("/add-teacher", async (req,res)=>{

    try{

        const {
            teacherId,
            name,
            password,
            department,
            subject
        } = req.body;

        // CHECK EXISTING
        let exists =
            await Teacher.findOne({ teacherId });

        if(exists){

            return res.json({
                success:false,
                message:"Teacher already exists"
            });

        }

        // DAYS
        const days = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday"
        ];

        // CLASSES
        const rooms = [
            "Class 5",
            "Class 6",
            "Class 7",
            "Class 8",
            "Class 9",
            "Class 10"
        ];

        // TIMINGS
        const periods = [

            {
                period:1,
                time:"9:00 AM - 10:00 AM"
            },

            {
                period:2,
                time:"10:00 AM - 11:00 AM"
            },

            {
                period:3,
                time:"11:00 AM - 12:00 PM"
            },

            {
                period:"Lunch",
                time:"12:00 PM - 1:00 PM"
            },

            {
                period:4,
                time:"1:00 PM - 2:00 PM"
            },

            {
                period:5,
                time:"2:00 PM - 3:00 PM"
            }

        ];

        let schedule = [];

        // GENERATE WEEKLY SCHEDULE
        days.forEach(day=>{

            // RANDOM FREE PERIOD
            let freePeriod =
                Math.floor(Math.random()*5)+1;

            periods.forEach((p,i)=>{

                // LUNCH
                if(p.period === "Lunch"){

                    schedule.push({
                        day,
                        period:"Lunch",
                        time:p.time,
                        subject:"Break",
                        room:"-"
                    });

                    return;
                }

                // FREE PERIOD
                if(p.period === freePeriod){

                    schedule.push({
                        day,
                        period:p.period,
                        time:p.time,
                        subject:"FREE",
                        room:"Free Period"
                    });

                    return;
                }

                // CLASS ALLOCATION
                let roomIndex =
                    (i + days.indexOf(day))
                    % rooms.length;

                schedule.push({

                    day,

                    period:p.period,

                    time:p.time,

                    subject,

                    room:rooms[roomIndex]

                });

            });

        });

        // SAVE TEACHER
        await Teacher.create({

            teacherId,
            name,
            password,
            department,
            schedule

        });

        res.json({

            success:true,
            message:"Teacher Added Successfully"

        });

    }catch(err){

        console.log(err);

        res.status(500).json({

            success:false,
            message:"Server Error"

        });

    }

});
/* =========================
   MANUAL SCHEDULE UPDATE
========================= */

router.post("/update-schedule", async (req, res) => {

    try{

        const {
            teacherId,
            day,
            period,
            time,
            subject,
            room
        } = req.body;

        let teacher =
            await Teacher.findOne({ teacherId });

        if(!teacher){

            return res.json({
                success:false,
                message:"Teacher not found"
            });
        }

        /* CHECK EXISTING SLOT */
        let existing =
            teacher.schedule.find(s =>

                s.day === day &&
                s.period == period

            );

        if(existing){

            /* UPDATE SLOT */
            existing.time = time;
            existing.subject = subject;
            existing.room = room;

        }else{

            /* ADD NEW SLOT */
      let existingSlot = teacher.schedule.find(s =>

    s.day === day &&
    s.period == period

);

if(existingSlot){

    existingSlot.subject = subject;
    existingSlot.room = room;
    existingSlot.time = time;

}else{

    teacher.schedule.push({
        day,
        period,
        time,
        subject,
        room
    });

}
        }

        await teacher.save();

        res.json({
            success:true,
            message:"Schedule Updated"
        });

    }catch(err){

        console.log(err);

        res.status(500).json({
            success:false
        });
    }

});

/* =========================
   CANCEL MANUAL SCHEDULE
========================= */

router.post("/cancel-schedule", async (req, res) => {

    try{

        const {
            teacherId,
            day,
            period
        } = req.body;

        let teacher =
            await Teacher.findOne({ teacherId });

        if(!teacher){

            return res.json({
                success:false,
                message:"Teacher not found"
            });
        }

        /* FIND SLOT */
        let slot =
            teacher.schedule.find(s =>

                s.day === day &&
                s.period == period

            );

        if(!slot){

            return res.json({
                success:false,
                message:"Schedule slot not found"
            });
        }

        /* RESTORE AUTOMATIC SCHEDULE */

        const defaultSubjects = {

            "Science":
                ["Physics","Chemistry","Biology"],

            "Languages":
                ["English","Hindi","Kannada"],

            "Social":
                ["Civics","History","Geography"],

            "Mathematics":
                ["Math","Math","Math"],

            "Games":
                ["Games","Games","Games"]

        };

        const rooms = [
            "Class 5",
            "Class 6",
            "Class 7",
            "Class 8",
            "Class 9",
            "Class 10"
        ];

        let subjects =
            defaultSubjects[teacher.department]
            || ["Subject"];

        let subjectIndex =
            (Number(period) - 1)
            % subjects.length;

        let roomIndex =
            (Number(period) - 1)
            % rooms.length;

        slot.subject =
            subjects[subjectIndex];

        slot.room =
            rooms[roomIndex];

        /* RESTORE DEFAULT TIME */

        const timings = {
            1:"9:00 AM - 10:00 AM",
            2:"10:00 AM - 11:00 AM",
            3:"11:00 AM - 12:00 PM",
            4:"1:00 PM - 2:00 PM",
            5:"2:00 PM - 3:00 PM"
        };

        slot.time =
            timings[period];

        await teacher.save();

        res.json({
            success:true,
            message:"Automatic schedule restored"
        });

    }catch(err){

        console.log(err);

        res.status(500).json({
            success:false
        });
    }

});


// ==============================
// EXPORT
// ==============================

module.exports = router;