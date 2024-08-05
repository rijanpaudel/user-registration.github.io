const mongoose = require("mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/UserRegistration1")
.then(()=>{
  console.log("Mongodb connected");
})

.catch(()=>{
  console.log("Failed to connect");
})

const loginSchema = new mongoose.Schema({
  fullname:{
    type: String,
    required: true
  },
  username:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true
  },
  phone:{
    type: String,
    required: true
  },
  password:{
    type: String,
    required: true
  }
})

const collection = new mongoose.model("Colection1", loginSchema)

module.exports = collection