const { Fee } = require("../models/feeModel");
const AppError = require("../utils/appError");
exports.createFee = async req => {
  console.log("REQUEST:", req);
  try {
    const fee = await Fee.create({
      ...req
    });
    if (fee) return true;
  } catch (error) {
    console.log("ERROR: ", error);
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

// exports.getFee = async studentId => {
//   return Fee.findOne({ student: studentId });
// };
