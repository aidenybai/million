const mongoose = require('mongoose');

var otpSchema = new mongoose.Schema({
    code: {
        type : String
    },
    email : {
        type : String,
        required : true
    },
    expiresIn : Number
},{
    timestamps : true
})


module.exports = new mongoose.model('otpModel',otpSchema);