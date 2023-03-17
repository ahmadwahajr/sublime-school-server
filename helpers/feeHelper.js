const { Fee } = require("../models/feeModel");
const AppError = require("../utils/appError");
exports.createFee = async (studentId, month, year) => {
  try {
    const exists = await Fee.exists({
      student: studentId,
      month: month,
      year: year
    });
    if (exists) return true;
    const fee = await Fee.create({
      student: studentId,
      month: month,
      year: year
    });
    if (fee) return true;
  } catch (error) {
    return false;
  }
};
exports.removeFee = async studentId => {
  try {
    const fee = await Fee.deleteMany({
      student: studentId
    });
    if (fee) return true;
  } catch (error) {
    return false;
  }
};

exports.getFee = async studentId => {
  return Fee.findOne({ student: studentId });
};
