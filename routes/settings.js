const express = require("express");
const router = express.Router();
const { getPvcTc, getDashboardData,getMaintenance ,setMaintenance} = require("../controllers/settings");

router.route("/get-pvctc").get(getPvcTc);
router.route("/get-maintenance").get(getMaintenance);
router.route("/set-maintenance").get(setMaintenance);
router.route("/get-dashboard-data").get(getDashboardData);

module.exports = router;
