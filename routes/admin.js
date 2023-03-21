const express = require("express");
const router = express.Router();
const authAdmin = require('../middleware/authentication')
const {
  registerAdmin,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  getUserDevices,
  adminLogin,
} = require("../controllers/users");


// router.route("*").get(authAdmin);
router.route("/get-users").get(getAllUsers);
router.route("/:id").get(getSingleUser);
router.route("/get-devices/:id").get(getUserDevices);
router.route("/:id").put(updateUser);
router.route("/:id").delete(deleteUser);

router.route("/login").post(adminLogin,);
router.route("/register").post(registerAdmin);

module.exports = router;
