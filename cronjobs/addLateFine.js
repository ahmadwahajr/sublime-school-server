const cron = require("node-cron");
const { Student } = require("../models/studentsModel");
const { Fee } = require("../models/feeHistoryModel");
const Fine = 50;
const addLateFine = cron.schedule("* * 11-31 * *", async () => { // Cron job runs daily from 11th to 31st of every month
  try {
    //const currentDate = new Date();
    const unpaidStudents = await Fee.distinct("studentId", { isPaid: false }); // Get distinct studentIds from feeHistory where isPaid is false

    const data = await Student.updateMany(
      { _id: { $in: unpaidStudents } }, // Update students whose _id is in the array of unpaidStudents
      [

        {
            $addFields: {
              "balance.lateFine": { 
                $sum: ["$balance.lateFine", Fine],
                
            }
           
            }
        }
      ]
    ).exec();
    console.log("Late fine added successfully", data);
  } catch (error) {
    console.log("Got Error", error);
  }
});

module.exports = { addLateFine };
