var express = require("express");
const taskController = require("../controllers/TaskController");
const adminController = require("../controllers/AdminController");
var router = express.Router();

router.post("/task/add-task", taskController.add);
router.post("/task/update-task", taskController.update);
router.post("/task/delete-task", taskController.delete);
router.get("/task/list", taskController.get);
router.get("/task/users-task", taskController.getUsersTask);
router.get("/user/list", adminController.getUserReports);

module.exports = router;
