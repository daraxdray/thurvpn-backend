const User = require("../model/users");
const Plan = require("../model/plans");
const speakeasy = require("speakeasy");
const nodemailer = require("nodemailer");
const Purchase = require("../model/purchases");
const bcrypt = require("bcrypt");
const emailSender = require("../services/mail_service");

exports.loginUser = async (req, res) => {
  try {
    const { email, token, deviceId, deviceName } = req.body;

    if ((!email || !token || !deviceId, !deviceName)) {
      const msg =
        (!email ? "Email, " : "") +
        (!token ? "Token, " : "") +
        (!deviceId ? "Device ID, " : "") +
        (!deviceName ? "Device Name" : "");
      return res.status(400).json({
        message: `Please provide all the required parameters: ${msg}`,
        status: false,
        data: [],
      });
    }

    const user = await User.findOne({ email }).populate("activePlan");

    if (!user) {
      return res.status(400).json({
        message: `Email does not exist, please send OTP`,
        status: false,
        data: [],
      });
    }

    //VALIDATE OTP(
    const verified = user.otpSecret == token;

    if (!verified) {
      return res
        .status(400)
        .json({ message: `Invalid OTP`, status: false, data: [] });
    }

    //HANDLE DEVICES
    const deviceMap = user.devices ?? new Map();

    //CHECK IF device does not already exist && ACTIVE SUBSCRIPTION
    if (
      user.isPremium &&
      user.devices != null &&
      deviceId in user.devices == false
    ) {
      //ADD TO DEVICES IF DEVICE COUNT IS LESS THAN PREMIUM PLAN
      const plan = await Plan.findOne({ _id: user.activePlan.plan_id });

      if (plan && user.devices.size >= plan.deviceCount) {
        return res.status(400).json({
          message: `Maximum device exceeded.`,
          status: false,
          data: user.devices,
        });
      } else {
        deviceMap.set(deviceId, { deviceName: deviceName, deviceId: deviceId });
        user.set("devices", deviceMap);
      }
    } else {
      deviceMap.clear();
      deviceMap.set(deviceId, { deviceName: deviceName, deviceId: deviceId });
      user.set("devices", deviceMap);
    }

    // const subscription = user.updateSubscriptionPlan()
    //create and save session/ device token
    const jwt = user.createJWT();
    user.deviceToken = jwt;
    await user.save();

    return res
      .status(200)
      .json({ message: "User found", data: { user, jwt }, status: true });
  } catch (error) {
    return failedResponseHandler(error, res);
  }
};

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: `Please provide your email address.`,
        data: [],
        status: false,
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email: email });
    }

    const mailer = new emailSender();

    const secret = speakeasy.generateSecret();

    const otp = speakeasy.totp({
      secret: secret.base32,
      encoding: "base32",
      time: 600000, // time in 5 minutes
    });

    user.otpSecret = otp;
    await user.save();

    const jwt = user.createJWT();
    const html = `<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 10px 20px; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #d62333;">Your OTP is ${otp}</h2>
    <p style="color: #333;">Use this OTP to verify your account within the next 5 minutes. Do not share this OTP with anyone. If it exceeds 5 minutes, request for a new OTP.</p>
    </div>`;
    // send mail with defined transport object
    let info = await mailer.sendMailTo(
      '"THURVPN" <youremail@gmail.com>',
      email,
      "OTP REQUEST",
      html
    );

    return res.status(200).json({
      message: "New OTP generated and sent",
      data: { user, otp, jwt },
      status: true,
    });
  } catch (error) {
    console.log(error);
    return failedResponseHandler(error, res);
  }
};

exports.getSingleUser = async (req, res) => {
  try {
    const { id: userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ message: "Missing user ID", status: false, data: [] });
    }

    const user = await User.findOne({ _id: userId }).populate("activePlan");

    if (!user) {
      return res.status(400).json({
        message: `No user with the provided id`,
        status: false,
        data: [],
      });
    }
    let purchase = await Purchase.findOne({ user_id: userId }).populate(
      "plan_id"
    );

    if (purchase) {
      purchase = purchase.toObject({ virtuals: true });
      if (purchase.plan_id != null) {
        const daysLeft = purchase.plan_id.duration - purchase.daysCount;
        return res.status(200).json({
          message: "User found",
          status: true,
          data: { ...user.toObject(),devices: user.devices, ...purchase, daysLeft },
        });
      }
    }
    return res
      .status(200)
      .json({ message: "User found", status: true, data: user });
  } catch (error) {
    console.log(error);
    return failedResponseHandler(error, res);
  }
};

exports.getUserDevices = async (req, res) => {
  try {
    const { id: userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ message: "Missing user ID", status: false, data: [] });
    }

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(400).json({
        message: `No user with the provided id`,
        status: false,
        data: [],
      });
    }

    //GET HOW MANY DAYS OF ACTIVEPLAN
    // if(user.activePlan){

    //   return res.status(200).json({message : 'User found',  status: true, data:{user,daysUsed}})
    // }
    return res
      .status(200)
      .json({ message: "User found", status: true, data: user.devices });
  } catch (error) {
    return failedResponseHandler(error, res);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});

    if (!users) {
      return res.status(404).json({ error: "No users found!" });
    }

    return res.status(200).json({
      data: { count: users.length, users },
      status: true,
      message: "User listed",
    });
  } catch (error) {
    console.log(error);
    return failedResponseHandler(error, res);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id: userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ message: "Missing user ID", data: [], status: false });
    }
    delete req.body.email; //removes email object
    const updateUser = await User.findByIdAndUpdate({ _id: userId }, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updateUser) {
      return res
        .status(404)
        .json({ message: "User does not exist", data: [], status: false });
    }

    const subscription = updateUser.updateSubscriptionPlan();

    await updateUser.save(); // save the updated user object to the database

    return res.status(201).json({
      message: "User data updated successfully",
      updateUser,
      subscription,
    });
  } catch (error) {
    console.log(error);
    return failedResponseHandler(error, res);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id: userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ message: "Missing user ID", status: false, data: [] });
    }

    const deleteUser = await User.findByIdAndDelete(userId);

    if (!deleteUser) {
      return res
        .status(404)
        .json({ message: "User does not exist", data: [], status: false });
    }

    return res.status(200).json({
      message: "User deleted successfully",
      data: deleteUser,
      status: true,
    });
  } catch (error) {
    console.log(error);
    return failedResponseHandler(error, res);
  }
};

exports.deleteUserDevice = async (req, res) => {
  try {
    const { deviceId, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing user ID" });
    }
    if (!deviceId) {
      return res
        .status(400)
        .json({ error: "Please provide a deveice ID to delete" });
    }

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User does not exist", data: [], status: false });
    }

    if (!user.devices.has(deviceId)) {
      return res
        .status(400)
        .json({ message: "Device does not exist", data: [], status: false });
    }

    user.devices.delete(deviceId);
    user.set("devices", user.devices);

    await user.save();
    return res.status(200).json({
      message: "Device deleted successfully",
      data: [],
      status: true,
    });
  } catch (error) {
    console.log(error);
    return failedResponseHandler(error, res);
  }
};

//****************************ADMIN ROUTES********* */

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const msg = (!email ? "Email, " : "") + (!password ? "Password, " : "");
      return res.status(400).json({
        message: `Please provide all the required parameters: ${msg}`,
        status: false,
        data: [],
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: `Email does not exist, please try again with a different email`,
        status: false,
        data: [],
      });
    }

    const result = await bcrypt.compare(password, user.pwHash);

    if (!result) {
      return res
        .status(400)
        .json({ message: `Invalid Password`, status: false, data: [] });
    }
    //create and save session/ device token
    const jwt = user.createJWT();
    user.deviceToken = jwt;
    await user.save();

    // if(!user.isAdmin){
    //   return res
    //     .status(400)
    //     .json({ message: `Account UnAuthorized`, status: false, data: [] });
    // }
    return res
      .status(200)
      .json({ message: "User found", data: { user, jwt }, status: true });
  } catch (error) {
    return failedResponseHandler(error, res);
  }
};

exports.registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Please provide your email address.",
        status: false,
        data: [],
      });
    }
    if (!password) {
      return res.status(400).json({
        message: "Please provide your password.",
        status: false,
        data: [],
      });
    }

    const foundUser = await User.findOne({ email });

    if (foundUser) {
      return res.status(400).json({
        message: "User with the email you supplied already exists.",
        status: false,
        data: [],
      });
    }
    const hash = await bcrypt.hash(password, 10);
    // store hash in the database

    if (!hash) {
      return res.status(400).json({
        message: "Unable to create password.",
        status: false,
        data: [],
      });
    }

    const user = await User.create({
      ...req.body,
      otpSecret: null,
      otpVerified: true,
      pwHash: hash,
      isAdmin:true
    });

    if (!user) {
      return res.status(400).json({
        message: "Unable to create user account.",
        status: false,
        data: [],
      });
    }

    return res.status(201).json({
      message: "Account created",
      data: user,
      status: true,
    });
  } catch (error) {
    console.log("The ERR", error);
    return failedResponseHandler(error, res);
  }
};
