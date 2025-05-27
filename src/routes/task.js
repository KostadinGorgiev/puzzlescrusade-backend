var express = require("express");
const taskController = require("../controllers/taskController");
var router = express.Router();

router.get("/list", taskController.list);
router.post("/verify-password", taskController.verifyPassword);
router.post("/verify-brickwall", taskController.verifyBrickwall);
router.post("/complete", taskController.complete);
router.post("/claim", taskController.claim);
router.get("/test", taskController.testFunction);
router.post("/card-referral-status", taskController.cardReferralStatus);

module.exports = router;
