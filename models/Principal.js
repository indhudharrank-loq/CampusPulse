const mongoose = require("mongoose");

const PrincipalSchema = new mongoose.Schema({
    username: String,
    password: String
});

module.exports = mongoose.model("Principal", PrincipalSchema);