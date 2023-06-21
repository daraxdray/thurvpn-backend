

const User = require("../model/users");
const Plan = require("../model/plans");
const Purchase = require("../model/purchases");
const Settings = require("../model/settings");
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
            devices.push(...user.toObject().devices);
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

exports.getMaintenance = async (req,res)=>{

        try{
          const maintenance  =  await Settings.findOne({key:'maintenance'});
        return res.status(200).json({
            data: maintenance,
            message:"Maintenance Data Fetched",
            status:true
        })
          }
          catch(e){
            
            return res.status(400).json({
              data: [],
              message:"Failed to fetch mode",
              status:false
          })
          }

}
exports.setMaintenance = async (req, res) => {
  const { status, subject, body, } = req.body;

  try {
    if (status == null) {
      let msg =
        (status == null ? ", STATUS " : "");
      return res
        .status(400)
        .json({
          data: [],
          status: false,
          message: "Missing or Invalid parameter(s): " + msg,
        });
    }
    let maintenance = await Settings.findOne({key:'maintenance'});
    let prevValue;
    if(maintenance){
      prevValue = maintenance.value;
      if(body) {
        prevValue.body = body;
        }
        if(subject){
          prevValue.subject = subject
        }
        if(status != null){
          prevValue.status = status;
        }
        maintenance.value = prevValue;
        maintenance.save();
    }else{
      maintenance = await Settings.create({
        key: "maintenance",
        value: {
          body: body ?? "Scheduled Maintenance Notice",
          subject:subject ?? "We are performing scheduled maintenance to enhance the performance and reliability of our services. During this time, access to our platform may be temporarily interrupted. We apologize for any inconvenience caused and appreciate your patience as we work to improve your experience. Thank you for your understanding.",
          status:status ?? true
        }
      });

    }

    //if maintenance is successfully created or updated
    if (maintenance) {
      
      return res
        .status(200)
        .json({
          data: maintenance,
          status: true,
          message: "Maintenance created or updated successfully.",
        });
    }
    return res
      .status(400)
      .json({
        data: [],
        status: false,
        message: "Unable to submit feedback",
      });
  } catch (error) {
   return failedResponseHandler(error, res);
  }}

