const express = require("express");
const router = express.Router();
const feeController = require("../controllers/feeController");
const middleware = require("../middlewares/auth");

// Protect all routes after this middleware
router.use(middleware.protect);
router.post("/toggle-fee", feeController.toggleFee);
// router.post("/update-student", studentController.updateStudent);
// router.post("/delete-student", studentController.deleteStudent);
// router.get("/get-students", studentController.getStudents);

module.exports = router;
