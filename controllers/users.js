const User = require('../model/users')
const speakeasy = require('speakeasy');
const nodemailer = require('nodemailer');

exports.registerUser = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Please provide your email address.' });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ error: 'User with the email you supplied already exists.' });
    }

    const secret = speakeasy.generateSecret();

    const otp = speakeasy.totp({
      secret: secret.base32,
      encoding: 'base32',
      time: 600000, // time in 5 minutes
    });

    const newUser = await User.create({
      ...req.body,
      otpSecret: secret.base32,
      otpVerified: false,
    });

    // create reusable transporter object
    let transporter = nodemailer.createTransport({
        service : 'gmail',
        auth : {
            user : "stephen.ignatius@korsgy.com",
            pass : "tczkonuzmpehzbeg"
        }
    })

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"THURVPN" <youremail@gmail.com>', // sender address
      to: email, // list of receivers
      subject: 'OTP REQUEST', // Subject line
      html: `<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 10px 20px; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #d62333;">Your OTP is ${otp}</h2>
              <p style="color: #333;">Use this OTP to verify your account within the next 5 minutes. Do not share this OTP with anyone. If it exceeds 5 minutes, request for a new OTP.</p>
            </div>`, // html body
    });

    console.log('Message sent: %s', info.messageId);

    return res.status(201).json({ message: 'OTP generated and sent', newUser, otp });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error...', error: error.message });
  }
};
  
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
  
          return res.status(200).json({message : 'User found', user, jwt})
  
      } catch (error) {
          console.log(error)
          return res.status(500).json({message : `Internal server error`, error : error.message})
      }
  }
  
  exports.resendOTP = async (req, res) => {
    try {
      const { email } = req.body;
  
      if (!email) {
        return res.status(400).json({ error: `Please provide your email address.` });
      }
  
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ error: `User with the email you supplied does not exist.` });
      }
  
      if (user.otpVerified) {
        return res.status(400).json({ error: `User has already been verified.` });
      }
  
      const secret = speakeasy.generateSecret();
  
      const otp = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32',
        time: 600000 // time in 5 minutes
      });
  
      user.otpSecret = secret.base32;
      await user.save();

      const jwt = user.createJWT()
  
      /// create reusable transporter object
      let transporter = nodemailer.createTransport({
        service : 'gmail',
        auth : {
            user : "stephen.ignatius@korsgy.com",
            pass : "tczkonuzmpehzbeg"
        }
        })

        // send mail with defined transport object
        let info = await transporter.sendMail({
        from: '"THURVPN" <youremail@gmail.com>', // sender address
        to: email, // list of receivers
        subject: 'OTP REQUEST', // Subject line
        html: `<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 10px 20px; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #d62333;">Your OTP is ${otp}</h2>
                <p style="color: #333;">Use this OTP to verify your account within the next 5 minutes. Do not share this OTP with anyone. If it exceeds 5 minutes, request for a new OTP.</p>
                </div>`, // html body
        });

        console.log('Message sent: %s', info.messageId);

      return res.status(200).json({ message: 'New OTP generated and sent', user, otp, jwt });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal server error...', error: error.message });
    }
  };
  
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