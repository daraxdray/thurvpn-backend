const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  pwHash: {
    type: String,
  },
  otpSecret: {
    type: String,
  },
  stripeId: {
    type: String,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  devices: {
    type: Array,
    of: Object,
  },
  activePlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Purchase",
    default: null,
  },
  active: {
    type: Boolean,
    default: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  deviceToken: {
    type: String,
    default: "",
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

userSchema.methods.createJWT = function () {
  return jwt.sign(
    { id: this._id, username: this.username, email: this.email },
    process.env.JWT_SECRET
  );
};

userSchema.pre("save", function (next) {
  const now = Date.now();
  this.updated_at = now;
  if (!this.created_at) {
    this.created_at = now;
  }
  next();
});

// userSchema.pre('save', function (next) {
//   const currentDate = new Date()
//   switch (this.subscribedPlan) {
//     case 'trial':
//       this.subscriptionTimestamp = new Date(currentDate.getTime() + 60000) // set to last for 1 minute
//       break
//     case 'basic':
//       this.subscriptionTimestamp = new Date(currentDate.setMonth(currentDate.getMonth() + 1)) // set to last for 1 month
//       break
//     case 'premium':
//       this.subscriptionTimestamp = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1)) // set to last for 1 year
//       break
//     case 'none' :
//       this.subscriptionTimestamp = null
//       break
//     default:
//       this.subscriptionTimestamp = null
//   }
//   next()
// })

userSchema.methods.updateSubscriptionPlan = function () {
  const currentDate = new Date();
  if (this.subscriptionTimestamp && currentDate > this.subscriptionTimestamp) {
    this.subscribedPlan = "none";
    this.subscriptionTimestamp = null;
  }
  return this.subscribedPlan;
};

module.exports = mongoose.model("User", userSchema);
