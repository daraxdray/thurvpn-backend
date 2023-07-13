const mongoose = require("mongoose");

const PendingSubSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },
  
  selectedPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Purchase",
    default: null,
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});


PendingSubSchema.pre("save", function (next) {
  const now = Date.now();
  this.updated_at = now;
  if (!this.created_at) {
    this.created_at = now;
  }
  next();
});


// planSchema.pre("update", function (next) {
//   const now = Date.now();
//   this.updated_at = now;
//   this.count++;
//   next();
// });

module.exports = mongoose.model("PendingSubs", PendingSubSchema);
