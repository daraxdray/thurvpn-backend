const express = require('express');
const router = express.Router();
const {createFeedback, sendReportToMail} = require('../controllers/feedback')

router.route('/submit').post(createFeedback)
router.route('/send-mail').post(sendReportToMail)


module.exports = router;
