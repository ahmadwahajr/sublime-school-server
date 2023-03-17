const { Fee } = require("../models/feeModel");
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
