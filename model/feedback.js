const mongoose = require('mongoose')

const feedbackShema = new mongoose.Schema({
    subject : {
        type : String,
    },

    email : {
        type : String
    },

    description : {
        type : String
    },
    userId: {
        type:String,
    }
})

module.exports = mongoose.model('Feedback', feedbackShema)