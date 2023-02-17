const User = require('../model/users')
const speakeasy = require('speakeasy');

exports.registerUser = async (req, res) => {
    try {
      const {email} = req.body
  
      if (!email) {
          return res.status(400).json({error : `Please provide your email address.`})
      }
  
      const user = await User.findOne({email})
  
      if (user) {
          return res.status(400).json({error : `User with the email you supplied already exists.`})   
      }
  
      const secret = speakeasy.generateSecret();
      
      const token = speakeasy.totp({
          secret: secret.base32,
          encoding: 'base32',
          time: 600000 // time in 5 minutes
        });      
  
      const newUser = await User.create({
        ...req.body,
        otpSecret: secret.base32,
        otpVerified: false
      });
  
      const jwt = newUser.createJWT()
  
      // Here you can send the OTP to the user via email, SMS or some other means
      // You can use a third-party library like nodemailer to send emails
      // In this example, we are simply sending the OTP back to the client for testing purposes
      return res.status(201).json({message : 'OTP generated and sent', newUser, token, jwt});
    } catch (error) {
      console.log(error)
      return res.status(500).json({message : 'Internal server error...', error : error.message}) 
    }
  } 
  
  exports.loginUser = async (req, res) => {
      try {
          const {email, token} = req.body
  
          if (!email || !token) {
              return res.status(400).json({error : `Please provide all the required parameters`})
          }
  
          const user = await User.findOne({email})
  
          if (!user) {
              return res.status(400).json({error : `Email does not exist, please sign up`})
          }
  
          if (!user.otpVerified) {
              const verified = speakeasy.totp.verify({
                secret: user.otpSecret,
                encoding: 'base32',
                token: token,
                window: 600000 // time in 5 minutes
              });
  
              if (!verified) {
                return res.status(400).json({error : `Invalid OTP`})
              }
  
              // If the OTP is verified, mark the user as verified in the database
              user.otpVerified = true;
              await user.save();
          }
  
          const subscription = user.updateSubscriptionPlan()
  
          const jwt = user.createJWT()
  
          return res.status(200).json({message : 'User found', user, jwt, subscription})
  
      } catch (error) {
          console.log(error)
          return res.status(500).json({message : `Internal server error`, error : error.message})
      }
  }
  
exports.getSingleUser = async (req, res) => {
    try {
        const {id : userId} = req.params

        if (!userId) {
            return res.status(400).json({error : 'Missing user ID'})
        }

        const user = await User.findOne({_id : userId})

        if (!user) {
            return res.status(400).json({error : `No user with the provided id`})
        }
        return res.status(200).json({message : 'User found', user})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Internal server error', error : error.message})
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({})

        if (!users) {
            return res.status(404).json({error : "No users found!"})
        }

        return res.status(404).json({total_users : users.length, users})

    } catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Internal server error', error : error.message})
    }
}

exports.updateUser = async (req, res) => {
    try {
        const {id : userId} = req.params

        if (!userId) {
            return res.status(400).json({error : 'Missing user ID'})
        }

        const updateUser = await User.findByIdAndUpdate({_id : userId}, req.body, {new : true, runValidators : true})

        if (!updateUser) {
            return res.status(404).json({error : "User does not exist"})
        }

        const subscription = updateUser.updateSubscriptionPlan()

        await updateUser.save(); // save the updated user object to the database

        return res.status(201).json({message : 'User data updated successfully', updateUser, subscription})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Internal server error', error : error.message})
    }
}


exports.deleteUser = async (req, res) => {
    try {
        const {id : userId} = req.params

        if (!userId) {
            return res.status(400).json({error : 'Missing user ID'})
        }

        const deleteUser = await User.findByIdAndDelete(userId)

        if (!deleteUser) {
            return res.status(404).json({error : "User does not exist"})
        }

        return res.status(200).json({message : 'User deleted successfully', user_info : deleteUser})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Internal server error', error : error.message})
    }
}