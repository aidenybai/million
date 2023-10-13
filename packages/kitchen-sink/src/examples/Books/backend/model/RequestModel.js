const express = require('express');
const mongoose = require('mongoose');


const RequestSchema = new mongoose.Schema({
    email :{
        type : String,
        required : true
    },
    name : {
        type : String,
        required :true
    },
    author : {
        type : String,
        required : true
    },
    username : {
        type : String,
        required : true
    }
   
})




module.exports = new mongoose.model('RequestBook',RequestSchema);