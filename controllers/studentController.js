const { Student } = require("../models/studentsModel");
const AppError = require("../utils/appError");
const feeHelper = require("../helpers/feeHelper");
exports.addStudent = async (req, res, next) => {
  const {
    name,
    rollNo,
    fatherName,
    admissionDate,
    phoneNo1,
    phoneNo2,
    classNo,
    batch,
    dubata,
    fee,
    enrolledIn
  } = req.body;
  if (
    !name ||
    !fatherName ||
    !rollNo ||
    !admissionDate ||
    !phoneNo1 ||
    !classNo ||
    !batch ||
    !dubata ||
    !fee
  )
    next(new Error("Invalid Data"));
  const input = { ...req.body, balance: { ...req.body.fee, lateFine: 0 } };
  console.log("INPUT:", input);
  try {
    const student = await Student.create({
      ...input,
      admissionDate: new Date(req.body.admissionDate)
    });

    if (student) {
      // const month = new Date().getMonth();
      // const year = new Date().getFullYear();
      // const data = await feeHelper.createFee(student._id, month, year);

      const feeDetails = await feeHelper.getFee(student._id);

      let studentWithFee = { studentData: student, feeDetails };
      res.status(200).json({
        status: "success",
        data: studentWithFee
      });
    }
  } catch (error) {
    if (error?.code === 11000) next(new Error("Roll no already exists!"));
    next(new Error("Something went wrong"));
  }
};

exports.getStudents = async (req, res, next) => {
  try {
    const students = await Student.find({
      classNo: req.query.classNo,
      enrolledIn: req.query.enrolledIn
    })
      .sort({ name: 1 })
      .exec();
    if (students) {
      let studentsWithFee = await Promise.all(
        students.map(async function (data) {
          const feeDetails = await feeHelper.getFee(data._id);
          return { studentData: data, feeDetails };
        })
      );
      res.status(200).json({
        status: "success",
        data: studentsWithFee
      });
    } else
      res.status(404).json({
        status: "failed",
        message: "Notifications Not Found"
      });
  } catch (err) {
    next(new Error("Something went wrong!"));
  }
};

exports.updateStudent = async (req, res, next) => {
  console.log(req.body);
  try {
    let data = await Student.findByIdAndUpdate(
      req.body._id,
      {
        $set: { ...req.body }
      },
      {
        new: true,
        runValidators: true
      }
    );
    if (data)
      return res.status(200).json({
        status: "success",
        data
      });
  } catch (err) {
    next(new Error("Something went wrong"));
  }
};
exports.payFee = async (req, res, next) => {
  const { schoolFee, syllabusFee, annualFee, registrationFee } =
    req.body.balance;
  console.log(schoolFee, syllabusFee, annualFee, registrationFee);
  try {
    let data = await Student.findByIdAndUpdate(
      req.body._id,
      {
        $inc: {
          "balance.schoolFee": -schoolFee,
          "balance.syllabusFee": -syllabusFee,
          "balance.annualFee": -annualFee,
          "balance.registrationFee": -registrationFee
          // "balance.lateFine": -lateFine
        }
      },
      {
        new: true,
        runValidators: true
      }
    );
    if (data)
      return res.status(200).json({
        status: "success",
        data
      });
    else {
      next(new Error("Something went wrong!"));
    }
  } catch (err) {
    next(new Error("Something went wrong"));
  }
};
exports.deleteStudent = async (req, res, next) => {
  try {
    let doc = await Student.findByIdAndRemove(req.body._id);
    feeHelper.removeFee(req.body._id);

    return res.status(200).json({
      status: "success",
      data: {
        doc
      }
    });
  } catch (err) {
    if (error?.code === 11000) next(new Error("Roll no already exists!"));
    next(new Error("Something went wrong"));
  }
};
