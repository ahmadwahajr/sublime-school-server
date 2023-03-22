const { Fee } = require("../models/feeHistoryModel");
const AppError = require("../utils/appError");
exports.toggleFee = async (req, res, next) => {
  const { month, year, id, isPaid } = req.body;
  try {
    let doc = await Fee.findOneAndUpdate(
      {
        student: id,
        month: month,
        year: year
      },
      {
        $set: { isPaid: isPaid }
      },
      {
        new: true,
        runValidators: true
      }
    );
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

exports.getFeeHistory = async (req, res, next) => {
  console.log(req.query);
  try {
    const feeRecords = await Fee.find({
      student: req.query._id
    })
      .sort({ createdAt: -1 })
      .exec();
    if (feeRecords) {
      res.status(200).json({
        status: "success",
        data: feeRecords
      });
    } else
      res.status(404).json({
        status: "failed",
        message: "No record Found!"
      });
  } catch (err) {
    next(new Error("Something went wrong!"));
  }
};
