var express = require("express");
const userController = require("../controllers/userController");
var router = express.Router();

router.post("/initialize", userController.initialize);
router.post("/tap", userController.tap);
router.post("/boost", userController.boost);
router.post("/referrals", userController.getReferral);

module.exports = router;
