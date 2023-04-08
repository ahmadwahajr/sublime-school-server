const mongoose = require("mongoose");
const { addTutionFee } = require("./cronjobs/addTuitionFee");
// const server = require("./socket");
const dotenv = require("dotenv");

dotenv.config({
  path: "./config.env"
});
// console.log("addTution:", addTutionFee);

process.on("uncaughtException", err => {
  console.log("UNCAUGHT EXCEPTION!!! shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require("./app");
const database = process.env.DATABASE;

exports.mongoConnection = mongoose
  .connect(database, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(con => {
    console.log("DB connection Successfully!");
    addTutionFee.start();
    return con;
  })
  .catch(err => console.log(err));

// Start the server
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Application is running on port ${port}`);
});

process.on("unhandledRejection", err => {
  console.log("UNHANDLED REJECTION!!!  shutting down ...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
