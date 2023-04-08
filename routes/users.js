const express = require("express");
const router = express.Router();
const authAdmin = require("../middleware/authentication");
const {
  registerAdmin,
  loginUser,
  sendOTP,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  getUserDevices,
  adminLogin,
  deleteUserDevice,
  getLatestDevices
} = require("../controllers/users");

router.route("/login").post(loginUser);
router.route("/send-otp").post(sendOTP);
//ensure delete device comes first
router.route("/delete-device").delete(deleteUserDevice);
router.route("/get/:id").get(getSingleUser);
router.route("/get-devices/:id").get(getUserDevices);
router.route("/get/latest-devices").get(getLatestDevices);
router.route("/:id").put(updateUser);
router.route("/delete/:id").delete(deleteUser);
module.exports = router;
