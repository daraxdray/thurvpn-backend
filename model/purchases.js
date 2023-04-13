const mongoose = require("mongoose");
const moment = require("moment");
const Plan = require("./plans");
const purchaseSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  plan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan"
  },

  active: {
    type: Boolean,
    default: false
  },
  created_at: { type: Date, default: Date.now },
  expire_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});
purchaseSchema.virtual("daysCount").get(function () {
  const startDate = moment(this.updated_at);
  const endDate = moment();
  const days = endDate.diff(startDate, "days");
  return `${days}`;
});

purchaseSchema.pre("save", function (next) {
  const now = Date.now();
  this.updated_at = now;
  console.log("SAVING");
  if (!this.created_at) {
    this.created_at = now;
  }
  next();
});

purchaseSchema.pre("update", function (next) {
  const now = Date.now();
  console.log("UPDATING");
  this.updated_at = now;
  next();
});

module.exports = mongoose.model("Purchase", purchaseSchema);
