const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const middleware = require("../middlewares/auth");

// Protect all routes after this middleware
router.use(middleware.protect);
router.post("/add-student", studentController.addStudent);
router.post("/update-student", studentController.updateStudent);
router.post("/delete-student", studentController.deleteStudent);
router.get("/get-students", studentController.getStudents);

module.exports = router;
