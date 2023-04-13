

const User = require("../model/users");
const Plan = require("../model/plans");
const Purchase = require("../model/purchases");
const Vpn = require("../model/vpn");

exports.getPvcTc = (req,res)=>{
  const date = new Date();
  const file = require('../pvctc.json');
  file.updated_at = date;
    return res.json(file);
}


exports.getDashboardData = async (req,res)=>{

    const users = await User.find({});
    const plans = await Plan.find({});
    const subscriptions = await Purchase.find({});
    const vpns = await Vpn.find({});

    User.find().sort({ createdAt: -1 }).limit(10).exec((err, users) => {
        if (err) {
          return res.status(400).json({
            message: `Unable to process request`,
            status: false,
            data: [],
          });
        }
      
        const devices = [];
      
        for (const user of users) {
          if(user.devices != null){
            const dvs = user.devices;
            // console.log(user.toObject().devices.values())
            devices.push(...user.toObject().devices.values());
          }
        }
        
        return res.status(200).json({
            data: {users:users, totalUsers:users.length,totalVpn:vpns.length,totalPlans:plans.length,subscriptions:subscriptions.length,
            totalDevices:devices},
            message:"Data Fetched",
            status:true
        })
      
  
          });

}