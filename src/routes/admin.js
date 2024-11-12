var express = require("express");
const taskController = require("../controllers/TaskController");
var router = express.Router();

router.post("/task/add-task", taskController.add);
router.get("/task/list", taskController.get);

module.exports = router;
