const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    user_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },

    server_name : {
        type : String
    },

    ip_address : {
        type : String
    },

    sessions : {
        type : String
    }
})

module.exports = mongoose.model('Analytics', analyticsSchema)