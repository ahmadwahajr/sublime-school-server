const cron = require('node-cron');
const Student = require('../models/studentsModel');
// Run the job at the start of every month
const addTuitionFee=cron.schedule('0 0 1 * *', async () => {
    try {
      // Get the current month
      const currentMonth = moment().format('MMMM');
  
      // Update the tutionFee for all students
      await Student.updateMany(
        {}, // Update all students
        { $set: { [`balance.tutionFee.${currentMonth}`]: 1000 } } // Set the tutionFee for the current month
      );
  
      console.log(`Tution fee added to all students for ${currentMonth}`);
    } catch (error) {
      console.error('Error adding tution fee to students:', error);
    }
  });;
module.exports = addTuitionFee