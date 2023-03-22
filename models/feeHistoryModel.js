const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema(
  {
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
    date: {
      type: String,
      required: true
    },
    payment: {
      
      annualFee: {
        type: Number
      },
      registrationFee: {
        type: Number
      },
      lateFine: {
        type: Number
      },
      discountFee:{
        type: Number
      },
      tutionFee:{
        type: Number
      },
      syllabusFee: {
        type: Number
      },
      notesBalance:{
        type: Number
      },
      missalaneousBalance: {
        type: Number
      },
      testSessionFee:{
        type: Number
      }
    },

    isPaid: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    createdAt: "created_at"
  }
);
const Fee = mongoose.model("Fee", feeSchema);
module.exports = { Fee };
