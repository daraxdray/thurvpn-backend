const User = require('../model/users')
const Plan = require('../model/plans')
const speakeasy = require('speakeasy');
const nodemailer = require('nodemailer');


exports.registerUser = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide your email address.' , status:false, data:[]});
    }

    const foundUser = await User.findOne({ email });

    if (foundUser) {
      return res.status(400).json({ message: 'User with the email you supplied already exists.' , status: false, data:[]});
    }

    const secret = speakeasy.generateSecret();

    const otp = speakeasy.totp({
      secret: secret.base32,
      encoding: 'base32',
      time: 600000, // time in 5 minutes
    });

    const user = await User.create({
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

    return res.status(201).json({ message: 'OTP generated and sent', data:{user, otp},status:true});
  } catch (error) {
    console.log("The ERR",error);
    return res.status(400).json({ message: "Internal server error", status: false,data:[]  });
  }
};
  
  exports.loginUser = async (req, res) => {
      try {
          const {email, token, deviceId, deviceName} = req.body
  
          if (!email || !token || !deviceId, !deviceName) { 
              const msg = (!email?"Email, ":'') + (!token?"Token, ":'') + (!deviceId?"Device ID, ":'') + (!deviceName?"Device Name":"")
              return res.status(400).json({msg : `Please provide all the required parameters: ${msg}`, status:false,data:[]})
          }
  
          const user = await User.findOne({email}).populate('activePlan')
  
          if (!user) {
              return res.status(400).json({msg : `Email does not exist, please send OTP`, status: false, data:[]})
          }
  
          //VALIDATE OTP
          const verified = speakeasy.totp.verify({
            secret: user.otpSecret,
            encoding: 'base32',
            token: token,
            window: 600000 // time in 5 minutes
          });

          if (!verified) {
            return res.status(400).json({msg : `Invalid OTP`, status:false,data:[]})
          }

         
          //CHECK ACTIVE SUBSCRIPTION
          if(user.isPremium && (user.devices != null && deviceId in user.devices == false)){
            //ADD TO DEVICES IF DEVICE COUNT IS LESS THAN PREMIUM PLAN
            const plan = await Plan.findOne({_id:user.activePlan.plan_id});
            
            if(plan && (user.devices.size < plan.devices)){
            
              const deviceMap = user.devices;
              
              deviceMap.set(deviceId,{deviceName:deviceName,deviceId:deviceId})
              user.set('devices',deviceMap)
            }
          }
          
          // const subscription = user.updateSubscriptionPlan()
          //create and save session/ device token 
          const jwt = user.createJWT()
          user.deviceToken = jwt;
          await user.save();

          return res.status(200).json({msg : 'User found', data: {user, jwt},status:true})
  
      } catch (error) {
          
          return res.status(500).json({message : `Internal server error`, error : error.message})
      }
  }
  
  exports.sendOTP = async (req, res) => {
    try {
      const { email } = req.body;
  
      if (!email) {
        return res.status(400).json({ message: `Please provide your email address.` ,data:[],status:false});
      }
  
      let user = await User.findOne({ email });
  
      if (!user) {
        user = new User({email:email})
      }
  
      // if (user.otpVerified) {
      //   return res.status(400).json({ message: `User has already been verified.` ,data:[],status:false});
      // }
  
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

      return res.status(200).json({ message: 'New OTP generated and sent',data:{ user, otp, jwt}, status:true});
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: 'Internal server error...',status:false,data:[]});
    }
  };
  
exports.getSingleUser = async (req, res) => {
    try {
        const {id : userId} = req.params

        if (!userId) {
            return res.status(400).json({msg : 'Missing user ID', status: false, data:[]})
        }

        const user = await User.findOne({_id : userId}).populate('activePlan')

        if (!user) {
            return res.status(400).json({msg : `No user with the provided id`, status: false, data:[]})
        }

        //GET HOW MANY DAYS OF ACTIVEPLAN 
        // if(user.activePlan){        
         
        //   return res.status(200).json({msg : 'User found',  status: true, data:{user,daysUsed}})
        // }
        return res.status(200).json({msg : 'User found',  status: true, data:user})
    } catch (error) {
        console.log(error)
        return res.status(401).json({msg : 'Unable to get user data', status :false, data:[]})
    }
}
exports.getUserDevices = async (req, res) => {
    try {
        const {id : userId} = req.params

        if (!userId) {
            return res.status(400).json({msg : 'Missing user ID', status: false, data:[]})
        }

        const user = await User.findOne({_id : userId})

        if (!user) {
            return res.status(400).json({msg : `No user with the provided id`, status: false, data:[]})
        }

        //GET HOW MANY DAYS OF ACTIVEPLAN 
        // if(user.activePlan){        
         
        //   return res.status(200).json({msg : 'User found',  status: true, data:{user,daysUsed}})
        // }
        return res.status(200).json({msg : 'User found',  status: true, data:user.devices})
    } catch (error) {
        console.log(error)
        return res.status(401).json({msg : 'Unable to get user data', status :false, data:[]})
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({})

        if (!users) {
            return res.status(404).json({error : "No users found!"})
        }

        return res.status(200).json({data : {count:users.length, users}, status: true, message:"User listed"})

    } catch (error) {
        console.log(error)
        return res.status(500).json({msg : 'Internal server error', status :false, data:[]})
    }
}

exports.updateUser = async (req, res) => {
    try {
        const {id : userId} = req.params

        if (!userId) {
            return res.status(400).json({msg : 'Missing user ID',data:[], status:false})
        }
        delete req.body.email //removes email object
        const updateUser = await User.findByIdAndUpdate({_id : userId}, req.body, {new : true, runValidators : true})

        if (!updateUser) {
            return res.status(404).json({msg : "User does not exist", data:[], status:false})
        }

        const subscription = updateUser.updateSubscriptionPlan()

        await updateUser.save(); // save the updated user object to the database

        return res.status(201).json({message : 'User data updated successfully', updateUser, subscription})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Internal server error', status : false, data:[]})
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
            return res.status(404).json({msg : "User does not exist", data:[], status:false})
        }

        return res.status(200).json({msg : 'User deleted successfully', data:deleteUser, status: true})
    } catch (error) {
        console.log(error)
        return res.status(500).json({msg : 'Internal server error', data : [], status:false})
    }
}

