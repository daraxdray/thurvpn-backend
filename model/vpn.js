const mongoose = require("mongoose");

// const Region = new mongoose.Schema({
//     ipAddress: {
//         type:String,
//     },
//     port:{
//         type:String
//     },
//     slug: {
//         type:String
//     },
//     regionName: {
//         type: String,
//     },
//     filePath: {
//         type: String
//     }
// })

const vpnModel = new mongoose.Schema({
  country: {
    type: String,
    required: true,
  },
  countryCode: {
    type: String,
    required: true,
  },
  continent:{
    type: String,
    default:'Europe',
    enum: ['Africa', 'Antarctica', 'Asia', 'Europe', 'North America', 'South America', 'Australia/Oceania'],
  },
  countryImage: {
    type: String,
    required: true,
  },
  unicode: {
    type: String,
  },
  status: {
    type: Boolean,
    default: true,
  },
  isPremium: {
    type: Boolean,
    default: true,
  },
  regions: {
    type: [],
    default: [],
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Servers", vpnModel);
