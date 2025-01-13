var express = require("express");
var portionController = require('../controllers/portionController')
var router = express.Router();

router.post("/click-ingredient", portionController.clickIngredient);
router.post("/skip-wrong-attempt-time", portionController.skipWrongAttemptTime);
router.post("/craft", portionController.craft);
router.post("/collect", portionController.collect);

module.exports = router;
