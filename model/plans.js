const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    title : {
        type : String,
        required: true
    },

    description : {
        type : String,
        required: true
    },

    price : {
        type : Number,
        required: true
    },

    duration : {
        type : Number,
        required: true,
        unique:true
    },
    deviceCount: {
        type:Number,
        default:1,
        required:true
    },
    iapCode: {
        type:Number,
        required:true
    },
    active : {
        type : Boolean,
        default: true
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
})
planSchema.set('toObject', { virtuals: true })
planSchema.set('toJSON', { virtuals: true });
planSchema.pre('save', function(next) {
    const now = Date.now();
    this.updated_at = now;
    if (!this.created_at) {
      this.created_at = now;
    }
    next();
  });
  
  planSchema.pre('update', function(next) {
    const now = Date.now();
    this.updated_at = now;
    next();
  });


// author: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }
// Plan.findById(postId)
//   .populate('author')
//   .exec((err, post) => {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log(post);
//     }
//   });
module.exports = mongoose.model('Plan', planSchema)