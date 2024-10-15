var express = require("express");
const cardController = require("../controllers/cardController");
var router = express.Router();

router.post("/unlock", cardController.unlock);
router.post("/upgrade", cardController.upgrade);
router.post("/claim", cardController.claimProfit);

module.exports = router;
