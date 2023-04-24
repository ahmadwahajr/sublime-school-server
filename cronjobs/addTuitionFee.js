const cron = require("node-cron");
const { Student } = require("../models/studentsModel");

const addTutionFee = cron.schedule("0 0 1 * *", async () => {
  try {
    const data = await Student.updateMany({}, [
      {
        $addFields: {
          "balance.tutionFee": {
            $sum: ["$fee.tutionFee", "$balance.tutionFee"]
          }
        }
      }
    ]).exec();
    console.log("Data updated succesfully", data);
  } catch (error) {
    console.log("Got Error", error);
  }
});

module.exports = { addTutionFee };
