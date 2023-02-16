const mongoose = require('mongoose')

const promoSchema = new Schema({
    plan_id : {
        type  : Number
    },

    discount : {
        type : Number
    },

    discount_type : {
        type : String
    },

    isValid : {
        type : Boolean
    }
})

module.exports = mongoose.model('Promo', promoSchema)