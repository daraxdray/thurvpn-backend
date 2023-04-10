const express = require("express");
const router = express.Router();
const {
  getAllCountries,
  dwn,
  createVpn,
  getAllVpn,
  getAllFileVpn,
  deleteAllVpn,
  getVpnById,
  getVpnByQuery,
  deleteVpn,
  getRegionByQuery,
  updateRegion,
  createMultipleVpn,
  addRegions,
  addSingleRegion,
  getServerFile,
  deleteAllVpnWhere,
  updateCountry,
} = require("../controllers/vpn");

router.route("/get-all").get(getAllVpn);
router.route("/get-all-file").get(getAllFileVpn);
router.route("/dwn/:cc").get(dwn);
router.route("/gsf/:cc/:slug").get(getServerFile);
router.route("/get/:id").get(getVpnById);
router.route("/get").get(getVpnByQuery);
router.route("/get-region/:cc/:rn").get(getRegionByQuery);

router.route("/create").post(createVpn);
router.route("/create-all").post(createMultipleVpn);
router.route("/delete/:id").delete(deleteVpn);
router.route("/delete-all").delete(deleteAllVpn);
router.route("/delete-all-where").delete(deleteAllVpnWhere);

router.route("/update-country").put(updateCountry);
router.route("/update-region").put(updateRegion);
router.route("/add-regions").post(addRegions);
router.route("/add-a-region").post(addSingleRegion);
router.route("/get-countries").get(getAllCountries);
module.exports = router;
