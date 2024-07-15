var express = require("express");
var router = express.Router();
const jellyController = require("../controllers/jellyController");

router.get('/', jellyController.renderPage);
router.post('/getJellyfish', jellyController.getJellyfish);
router.post('/getJellyfishInfo', jellyController.getJellyfishInfo);

module.exports = router;