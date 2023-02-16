const mongoose = require('mongoose')

const feedbackShema = new mongoose.Schema({
    subject : {
        typr : String,
        enum : ['Cannot connect', 'Speed too slow', 'Auto disconnect', 'Streaming', 'Gaming', "Payment", "Other"]
    },

    email : {
        type : String
    },

    description : {
        type : String
    }
})

module.exports = mongoose.model('Feedback', feedbackShema)