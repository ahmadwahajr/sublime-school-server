const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true
      // required: [true, "Please fill your name"],
    },
    fatherName: {
      type: String,
      required: true
    },
    enrolledIn: {
      type: String,
      enum: ["school", "academy"]
    },
    rollNo: {
      type: String,
      lowercase: true,
      required: [true, "Please enter username"]
    },

    admissionDate: {
      type: Date,
      required: true
    },
    phoneNo1: {
      type: String,
      required: true
    },
    phoneNo2: {
      type: String,
      required: true
    },
    classNo: {
      type: String,
      requied: true
    },
    batch: {
      type: String,
      required: true
    },
    dubata: {
      type: String,
      required: true
    },
    fee: {
      schoolFee: {
        type: String,
        required: true
      },
      syllabusFee: {
        type: String,
        required: true
      },
      annualFee: {
        type: String
      },
      registrationFee: {
        type: String
      }
    }
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
).index({ rollNo: 1, classNo: 1, enrolledIn: 1 }, { unique: true });

const Student = mongoose.model("Student", studentSchema);

module.exports = { Student };
