const express = require('express');
const router = express.Router();

var {createPlan, updatePlan,getAllPlan} = require('../controllers/plans')

router.route('/create').post(createPlan)
router.route('/update').put(updatePlan)
router.route('/get-all').get(getAllPlan)

module.exports = router;
