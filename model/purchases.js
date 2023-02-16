const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    user_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },

    plan_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Plan'
    },

    purchase_validity : {
        type : Boolean,
        default : false
    }
})

module.exports = mongoose.model('Purchase', purchaseSchema)