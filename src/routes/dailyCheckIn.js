var express = require("express");
const dailyCheckinController = require("../controllers/dailyCheckinController");
var router = express.Router();

router.post("/claim", dailyCheckinController.claimBonus);

module.exports = router;
