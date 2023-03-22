const express = require("express");
const router = express.Router();
const { getPvcTc, getDashboardData } = require("../controllers/settings");

router.route("/get-pvctc").get(getPvcTc);
router.route("/get-dashboard-data").get(getDashboardData);

module.exports = router;
