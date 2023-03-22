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
    fee,
    balance,
    enrolledIn
  } = req.body;
  if (
    !name ||
    !fatherName ||
    !rollNo ||
    !admissionDate ||
    !phoneNo1 ||
    !classNo ||
    !fee||
    !balance||
    !enrolledIn
  )
    next(new Error("Invalid Data"));
  const input = { ...req.body, balance: { ...req.body.fee, lateFine: 0 , ...req.body.balance} };
  console.log("INPUT:", input);
  try {
    const student = await Student.create({
      ...input,
      admissionDate: new Date(req.body.admissionDate)
    });

    if (student) {
      //const feeDetails = await feeHelper.getFee(student._id);

      let studentWithFee = { studentData: student, feeDetails:{}};
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
  const {  tutionFee , syllabusFee, annualFee, registrationFee, lateFine,notesBalance, missalaneousBalance , testSessionFee , discountFee
   } = req.body.balance;
  console.log( tutionFee , syllabusFee, annualFee, registrationFee, lateFine,notesBalance, missalaneousBalance , testSessionFee , discountFee);
  try {
    let data = await Student.findByIdAndUpdate(
      req.body._id,
      {
        $inc: {
          ...(tutionFee && {"balance.tutionFee" : -tutionFee}),
          ...(syllabusFee && {"balance.syllabusFee" : -syllabusFee}),
          ...(registrationFee && {"balance.syllabusFee" : -registrationFee}),
          ...(lateFine && {"balance.syllabusFee" : -lateFine}),
          ...(notesBalance && {"balance.syllabusFee" : -notesBalance}),
          ...(missalaneousBalance && {"balance.syllabusFee" : -registrationFee}),
          ...(testSessionFee && {"balance.syllabusFee" : -registrationFee}),
          ...(discountFee && {"balance.syllabusFee" : -discountFee})

        }
      },
      {
        new: true,
        runValidators: true
      }
    );
    if (data) {
      const feeHistoryData = {
        student: req.body._id,
        month: new Date().getMonth(),
        date: new Date().getDate(),
        year: new Date().getFullYear(),
        payment: req.body.balance,
        isPaid: true
      };

      const payFee = await feeHelper.createFee(feeHistoryData);
      if (payFee) {
        return res.status(200).json({
          status: "success",
          studentData: data,
          feeDetails: payFee
        });
      } else {
        next(new Error("Fee Paid but not added to history!"));
      }
    } else {
      next(new Error("Error in Fee Payment!"));
    }
  } catch (err) {
    next(new Error("Internal Error!"));
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
