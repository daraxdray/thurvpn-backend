const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    
    key : {
        type : String
    },
    value: {
        type : Object
    },
    updated_at: { type: Date, default: Date.now },
})

module.exports = mongoose.model('settings', settingsSchema)