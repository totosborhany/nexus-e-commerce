const mongoose = require("mongoose");
const gameSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    // required: true,
  },
  description: {
    trim: true,
    type: String,
    // required: true,
  },
  price: {
    type: Number,
    min: [0, "invalid price must be above 0"],
    // required: true,
  },
  genre: {
    type: [String],
    trim:true,
    required:[true,'please specify genre']
  },
  category: {
    type: [String],
    trime:true
  },
  requirements:{
    type:String,
    trim:true
  },
  publisher:{
    type:mongoose.Schema.ObjectId,
    ref:'User',
    // required:true
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  slug: {
    type: String,
    lowercase: true,
  },
  photo:{
    type:String
  },
  desPhotos:
  {
    type:[String]
  },
  ratingsAverage:{
    type:Number
  },
  reviewCount:{
    type:Number
  },
  videos:[
    {
      type:String
    }
  ],
  tags:[
    {
      type:String ,
      enum:["top-seller","new"]
    }
  ]
});

gameSchema.pre("save", function () {
  this.slug = this.name.toLowerCase().split(" ").join("-");
});
const gameModel = mongoose.model("Game", gameSchema);
module.exports = gameModel;
