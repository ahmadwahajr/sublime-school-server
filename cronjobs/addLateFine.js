const cron = require('node-cron');
const Student = require('../models/studentsModel');

const addLateFine = cron.schedule('0 0 11-31 * *', async () => {
  try {
    // Get the current month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();

    // Find students whose fees are late for the current month
    const lateStudents = await Student.find({
      'balance.tutionFee.month': currentMonth,
      'balance.tutionFee.isPaid': false,
      'balance.tutionFee.lateFine': { $exists: false },
      'balance.tutionFee.dueDate': { $lt: currentDate }
    });

    // Loop through each late student and add a late fine of 50 rupees to their balance
    for (let student of lateStudents) {
      const lateFee = 50;
      //The tutionFeeIndex variable is then set to the index of the current month's tuition fee in the student's balance.tutionFee array using the findIndex() method.
      const tutionFeeIndex = student.balance.tutionFee.findIndex(item => item.month === currentMonth);
      student.balance.tutionFee[tutionFeeIndex].lateFine = lateFee;
      student.balance.tutionFee[tutionFeeIndex].amount += lateFee;
      await Student.findByIdAndUpdate(student._id, student);
      console.log(`Late fee of ${lateFee} added to ${student.name}'s balance for month ${currentMonth}`);
    }
  } catch (error) {
    console.error(error);
  }
});

module.exports = addLateFine;