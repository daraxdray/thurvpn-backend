const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    device_make : {
        type : String
    },

    email : {
        type : String,
        required : true
    },

    password : {
        type : String,
        required : true
    },

    plan_id : { 
        type : String
    }
}, {timestamps: true})


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

module.exports = mongoose.model('User', userSchema)