const express = require('express');
const router = express.Router();

var {createPlan, updatePlan,getAllPlan, deletePlan} = require('../controllers/plans')

router.route('/create').post(createPlan)
router.route('/update').put(updatePlan)
router.route('/get-all').get(getAllPlan)

router.route("/delete/:id").delete(deletePlan);
module.exports = router;
