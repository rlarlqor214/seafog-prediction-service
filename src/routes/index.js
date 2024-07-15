var express = require("express");
var router = express.Router();
const indexController = require("../controllers/indexController");

router.get('/', indexController.renderPage);
router.post('/seafog', indexController.getSeafog);
router.post('/seafogDissipation', indexController.getSeafogDissipation);

module.exports = router;
