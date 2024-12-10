var express = require("express");
const taskController = require("../controllers/TaskController");
var router = express.Router();

router.get("/list", taskController.list);
router.post("/verify-password", taskController.verifyPassword);
router.post("/complete", taskController.complete);
router.post("/claim", taskController.claim);
router.get("/test", taskController.testFunction);

module.exports = router;
