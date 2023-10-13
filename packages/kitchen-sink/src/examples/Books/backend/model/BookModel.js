const express = require('express');
const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema ({
    name : {
        type : String,
        required : true
    },
    author : {
        type : String ,
        required : true
    },
    description : {
        type : String,
         required : true
    },
   

     avaliable : {
        type : Boolean,
        default : true
        
     },
     image : {
        type : String,
        
        
     }
});


module.exports = new mongoose.model("Book",BookSchema);