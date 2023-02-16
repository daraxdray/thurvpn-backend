const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
    user_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    message : {
        type : String
    },
    visibility : {
        type : Boolean
    }
})

module.exports = mongoose.model('Support', supportSchema)