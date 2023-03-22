

const User = require("../model/users");
const Plan = require("../model/plans");
const Purchase = require("../model/purchases");
const Vpn = require("../model/vpn");

exports.getPvcTc = (req,res)=>{
    return res.json(require('../pvctc.json'));
}


exports.getDashboardData = async (req,res)=>{

    const users = await User.find({});
    const plans = await Plan.find({});
    const subscriptions = await Purchase.find({});
    const vpns = await Vpn.find({});

    return res.status(200).json({
        data: {users:users, totalUsers:users.length,totalVpn:vpns.length,totalPlans:plans.length,subscriptions:subscriptions.length},
        message:"Data Fetched",
        status:true
    })
}