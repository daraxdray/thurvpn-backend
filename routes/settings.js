const express = require('express');
const router = express.Router();
const {getPvcTc} = require('../controllers/settings')

router.route('/get-pvctc').get(getPvcTc)


module.exports = router;
