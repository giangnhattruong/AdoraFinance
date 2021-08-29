const mongoose = require("mongoose");
const { Schema } = mongoose;

const circSchema = new Schema({
    circSupply: Number
})

const CircSupply = mongoose.model("CircSupply", circSchema);
module.exports = CircSupply;