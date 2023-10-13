const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const router = require('./routes/BookRoute')
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:3000"],
    
    credentials: true,
  }

));
const MongoURI = "mongodb+srv://BharathK1:BharathK1@cluster0.u3jigft.mongodb.net/?retryWrites=true&w=majority";

app.use('/api/books',router);
app.use("/api/auth", authRoutes);
app.use("/api/auth",authRoutes)
mongoose.connect(MongoURI , {
    useNewUrlParser : true,
    UseUnifiedTopology : true
}).then (() => {
    console.log("Connected to MongoDB");
}).catch ((error) => {
    console.log("An error ocurred");
})


const Port = 5000;
app.listen(Port , ()=> {
    console.log(`Server started on port ${Port}`)
})