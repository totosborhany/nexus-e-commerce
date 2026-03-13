const path = require("path");
const dotenv = require("dotenv").config({
  path: path.join(__dirname, "config.env"),
});
const app = require("./app");
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE).then(()=>{
    console.log('db connected successfully');
}).catch((err)=>{
    console.log(err);
});
const port = process.env.PORT||3000;
app
  .listen(port, (err) => {
    console.log(`server works on ${port}`);
    if(err){
         console.log(err);
    }
  })
  ;
