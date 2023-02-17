const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },

  otpSecret : {
    type : String
  },

  otpVerified : {
    type : Boolean,
    default : false
  },

  deviceModel: {
    type: String,
    required: true
  },
  subscriptionTimestamp: {
    type: Date,
  },
  subscribedPlan: {
    type: String,
    enum : ['none', 'trial', 'basic', 'premium'],
    default : 'none'
  }
});

userSchema.methods.createJWT = function () {
    return jwt.sign({id : this._id, email : this.email}, process.env.JWT_SECRET, {expiresIn : process.env.JWT_EXPIRES})
}

userSchema.pre('save', function (next) {
  const currentDate = new Date()
  switch (this.subscribedPlan) {
    case 'trial':
      this.subscriptionTimestamp = new Date(currentDate.getTime() + 60000) // set to last for 1 minute
      break
    case 'basic':
      this.subscriptionTimestamp = new Date(currentDate.setMonth(currentDate.getMonth() + 1)) // set to last for 1 month
      break
    case 'premium':
      this.subscriptionTimestamp = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1)) // set to last for 1 year
      break
    case 'none' :
      this.subscriptionTimestamp = null
      break
    default:
      this.subscriptionTimestamp = null
  }
  next()
})

userSchema.methods.updateSubscriptionPlan = function () {
  const currentDate = new Date()
  if (this.subscriptionTimestamp && currentDate > this.subscriptionTimestamp) {
    this.subscribedPlan = 'none'
    this.subscriptionTimestamp = null
  }
  return this.subscribedPlan
}

module.exports = mongoose.model('User', userSchema)
