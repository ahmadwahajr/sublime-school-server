const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Types.ObjectId,
    ref: "Student"
    // required: [true, "Please fill your name"],
  },
  month: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  isPaid: {
    type: Boolean,
    default: false
  }
});
const Fee = mongoose.model("Fee", feeSchema);
module.exports = { Fee };
