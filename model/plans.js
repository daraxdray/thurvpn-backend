const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    title : {
        type : String
    },

    description : {
        type : String
    },

    price : {
        type : Number
    },

    validity : {
        type : Boolean
    },
    
    visibility : {
        type : Boolean
    }
})

module.exports = mongoose.model('Plan', planSchema)