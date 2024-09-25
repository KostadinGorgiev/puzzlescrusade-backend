var express = require("express");
const taskController = require("../controllers/TaskController");
var router = express.Router();

router.get("/list", taskController.list);
router.post("/complete", taskController.complete);
router.post("/claim", taskController.claim);

module.exports = router;
