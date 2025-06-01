const mongoose  = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/authtestapp');

const userSchema = mongoose.Schema({
    username:String , 
    email:String, 
    password : String , 
    age : Number,
    profilepic:{
        type:String , 
        default:'https://img.freepik.com/premium-vector/avatar-profile-icon-flat-style-male-user-profile-vector-illustration-isolated-background-man-profile-sign-business-concept_157943-38764.jpg?semt=ais_hybrid&w=740'
    }
})

module.exports =  mongoose.model('user',userSchema);