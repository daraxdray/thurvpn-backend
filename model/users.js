const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },

  password : {
    type  : String,
    required : true
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

userSchema.pre('save', async function () {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.createJWT = function () {
    return jwt.sign({id : this._id, email : this.email}, process.env.JWT_SECRET, {expiresIn : process.env.JWT_EXPIRES})
}

userSchema.methods.comparePasswords = async function (userPassword) {
    const isMatch = await bcrypt.compare(userPassword, this.password)
    return isMatch
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
