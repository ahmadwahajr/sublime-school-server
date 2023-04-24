const { Student } = require("../models/studentsModel");
const { Fee } = require("../models/feeHistoryModel");
const AppError = require("../utils/appError");
const feeHelper = require("../helpers/feeHelper");
const { default: mongoose } = require("mongoose");
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
    !fee ||
    !balance ||
    !enrolledIn
  )
    next(new Error("Invalid Data"));
  let input = {
    ...req.body,
    balance: { ...req.body.fee, lateFine: 0, ...req.body.balance }
  };
  if (req?.body?.fee?.testSessionFee) input.balance.testSessionFee = 0;

  try {
    const student = await Student.create({
      ...input,
      admissionDate: new Date(req.body.admissionDate)
    });

    if (student) {
      const feeDetails = await feeHelper.getFee(student._id);

      let studentWithFee = { studentData: student, feeDetails: {} };
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

// exports.payFee = async (req, res, next) => {
//   const session = await mongoose.startSession();
//   // const fee = session.getDatabase("sublime").fees;
//   // const students = session.getDatabase("sublime").students;
//   try {
//     session.startTransaction({
//       readConcern: { level: "snapshot" },
//       writeConcern: { w: "majority" }
//     });
//     const feeHistoryData = {
//       student: req.body._id,
//       month: new Date(req.body.payDate).getMonth(),
//       date: new Date(req.body.payDate).getDate(),
//       year: new Date(req.body.payDate).getFullYear(),
//       payment: req.body.balance,
//       isPaid: true
//     };
//     await session.withTransaction(async () => {
//       const [user, account] = await Promise.all([
//         students.findByIdAndUpdate(req.body._id, {
//           $inc: {
//             ...(req.body.balance.tutionFee && {
//               "balance.tutionFee": -req.body.balance.tutionFee
//             })
//           }
//         }),
//         fee.create(feeHistoryData)
//       ]);
//     });
//     await session.commitTransaction();
//     res.status(200).json({
//       status: "success",
//       studentData: data,
//       feeDetails: {}
//     });
//   } catch (error) {
//     console.log("ERROR", error);
//     session.abortTransaction();
//     next(new Error("Error in ending!"));
//   } finally {
//     session.endSession();
//   }
// };
exports.payFee = async (req, res, next) => {
  const {
    tutionFee,
    syllabusFee,
    annualFee,
    registrationFee,
    lateFine,
    notesBalance,
    missalaneousBalance,
    testSessionFee,
    discountFee,
    payDate
  } = req.body.balance;

  try {
    // session.startTransaction();
    // await session.withTransaction(async () => {
    const feeHistoryData = {
      student: req.body._id,
      month: new Date(req.body.payDate).getMonth(),
      date: new Date(req.body.payDate).getDate(),
      year: new Date(req.body.payDate).getFullYear(),
      payment: req.body.balance,
      isPaid: true
    };

    const payFees = await feeHelper.createFee(feeHistoryData);
    if (payFees) {
      let data = await Student.findByIdAndUpdate(
        req.body._id,
        {
          $inc: {
            ...(tutionFee && { "balance.tutionFee": -tutionFee }),
            ...(syllabusFee && { "balance.syllabusFee": -syllabusFee }),
            ...(registrationFee && {
              "balance.registrationFee": -registrationFee
            }),
            ...(lateFine && { "balance.lateFine": -lateFine }),
            ...(notesBalance && { "balance.notesBalance": -notesBalance }),
            ...(missalaneousBalance && {
              "balance.missalaneousBalance": -missalaneousBalance
            }),
            ...(testSessionFee && {
              "balance.testSessionFee": -testSessionFee
            }),
            ...(discountFee && { "balance.discountFee": -discountFee }),
            ...(annualFee && { "balance.annualFee": -annualFee })
          }
        },
        {
          new: true,
          runValidators: true
        }
      );
      if (data) {
        // await session.commitTransaction();
        // await session.endSession();
        return res.status(200).json({
          status: "success",
          studentData: data,
          feeDetails: payFees
        });
      } else {
        // await session.abortTransaction();
        // await session.endSession();
        next(new Error("Error in Fee Payment!"));
      }
    } else {
      // await session.abortTransaction();
      // await session.endSession();
      next(new Error("Fee Already Paid!"));
    }
  } catch (err) {
    console.log(err);
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
