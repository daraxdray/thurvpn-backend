const express = require('express');

const { createFAQ, getAllFAQs, getSingleFAQ, updateFAQ, deleteFAQ } = require('../controllers/faq');

const router = express.Router();

router.route('/all-faq').get(getAllFAQs);
router.route('/single-faq/:id').get(getSingleFAQ);
router.route('/create-faq').post(createFAQ);
router.route('/update-faq/:id').put(updateFAQ);
router.route('/delete-faq/:id').delete(deleteFAQ);

module.exports = router;