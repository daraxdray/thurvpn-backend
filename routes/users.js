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
} = require("../controllers/users");

router.route("/login").post(loginUser);
router.route("/send-otp").post(sendOTP);

router.route("/:id").get(getSingleUser);
router.route("/get-devices/:id").get(getUserDevices);
router.route("/:id").put(updateUser);
router.route("/:id").delete(deleteUser);

module.exports = router;
