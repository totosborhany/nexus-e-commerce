const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
  game:[ {
    type:mongoose.Schema.ObjectId
    ,
    ref:'Game',
    required:[true,"Booking must belong to a game"]
  }],
  user:{
    type:mongoose.Schema.ObjectId,
    ref:"User",
    required:[true,"Booking must belong to a user"]
  },
  price:{
    type:Number,
    required:true,

  },
  CreatedAt:{
    type:Date,
    default:Date.now()
  },
  paid:{
type:Boolean,
default:true
  }

});
bookingSchema.pre(/^find/,function(){
  this.populate('user').populate({
    path:'game',
    select:'name'
  });
});
const Booking = mongoose.model('Booking',bookingSchema);

module.exports = Booking;