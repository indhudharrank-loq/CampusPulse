const express = require("express");
const router = express.Router();

const Teacher = require("../models/Teacher");
const Principal = require("../models/Principal"); // 👈 added

// TEACHER LOGIN
router.post("/login", async (req, res) => {

    const { teacherId, password } = req.body;

    const teacher = await Teacher.findOne({ teacherId });

    if(!teacher || teacher.password !== password){
        return res.json({ success: false });
    }

    res.json({
        success: true,
        teacher: {
            teacherId: teacher.teacherId,
            name: teacher.name
        }
    });

});

// PRINCIPAL LOGIN 👇
router.post("/principal-login", async (req, res) => {

    const { username, password } = req.body;

    const user = await Principal.findOne({ username, password });

    if(user){
        res.json({ success: true });
    }else{
        res.json({ success: false });
    }

});
router.get("/schedule/:teacherId", async (req, res) => {

    const teacher = await Teacher.findOne({ teacherId: req.params.teacherId });

    if(!teacher){
       return res.json([]);
    }
    res.json(teacher.schedule);
        
    

});


router.post("/change-password", async (req, res) => {

    const { teacherId, oldPassword, newPassword } = req.body;

    const teacher = await Teacher.findOne({ teacherId, password: oldPassword });

    if(teacher){
        teacher.password = newPassword;
        await teacher.save();

        res.json({ success: true, message: "Password updated" });
    }else{
        res.json({ success: false, message: "Wrong old password" });
    }

});



module.exports = router;