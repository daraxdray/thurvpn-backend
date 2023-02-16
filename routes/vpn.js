const express = require('express');
const router = express.Router();
const { getAll, dwn} = require('../controllers/vpn')

router.route('/get-all').get(getAll)
router.route('/dwn/:cc').get(dwn)

module.exports = router;
