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
    !phoneNo2 ||
    !classNo ||
    !batch ||
    !dubata ||
    !fee
  )
    next(new Error("Invalid Data"));
  try {
    const exist = await Student.exists({
      classNo: classNo,
      rollNo: rollNo,
      enrolledIn: enrolledIn
    });
    if (exist) {
      next(new Error("Roll No Already Exists"));
      return;
    }
    const student = await Student.create({
      ...req.body,
      admissionDate: new Date(req.body.admissionDate)
    });

    if (student) {
      const month = new Date().getMonth();
      const year = new Date().getFullYear();

      const data = await feeHelper.createFee(student._id, month, year);

      if (data) {
        const feeDetails = await feeHelper.getFee(student._id);
        let studentWithFee = { studentData: student, feeDetails };
        res.status(200).json({
          status: "success",
          data: studentWithFee
        });
      }
    }
  } catch (error) {
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
    next(new Error("Something went wrong"));
  }
};
