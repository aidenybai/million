const express = require ('express');
const mongoose = require('mongoose');

const Book = require ('../model/BookModel');
const RequestBook = require('../model/RequestModel');
const RequestModel = require('../model/RequestModel');
const router = express.Router();

router.get('/getall', async (req, res) => {
    try {
      const books = await Book.find();
      res.status(200).json({
        books,
        message: 'Found all Books',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'An error occurred',
      });
    }
  });
  
  router.get('/getBook/:id', async (req, res) => {
    const id = req.params.id;
    try {
      const book = await Book.findById(id);
      if (!book) {
        return res.status(404).json({
          message: 'Book not found',
        });
      }
      res.status(200).json({
        book,
        message: 'Book is found with the given id',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'An error occurred',
      });
    }
  });
  

  router.post('/addBook', async (req, res) => {
    const { name, author, description,  image , available} = req.body;
    try {
      const bookCheck = await Book.findOne({ name });
      if (bookCheck) {
        return res.status(409).json({
          message: 'Book already exists',
          status: false,
        });
      }
  
      const newBook = new Book({
        name,
        author,
        description,
        // price,
        image,
        available
      });
  
      await newBook.save();
  
      console.log(newBook);
      res.status(201).json({
        newBook,
        message: 'Book added successfully',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'An error occurred',
      });
    }
  });
  
  router.put('/update/:id', async (req, res) => {
    console.log("OK")
    const id = req.params.id;
    const { name, author, description,  available , image} = req.body;
    try {
      let book= await Book.findById(id);
      if (!book) {
        return res.status(404).json({
          message: 'Book not found',
        });
      }
  
      book.name = name;
      book.author = author;
      book.description = description;
      // book.price = price;
      book.available = available;
      book.image = image
  
      book = await book.save();
  
      console.log(book);
      res.status(200).json({
        book,
        message: 'Book updated successfully',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'An error occurred',
      });
    }
  });
  
  
  router.delete('/delete/:id', async (req, res) => {
    const id = req.params.id;
    try {
      const book= await Book.findByIdAndDelete(id);
      if (!book) {
        return res.status(404).json({
          message: 'Book not found',
        });
      }
      res.status(200).json({
        message: 'Book deleted successfully',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'An error occurred',
      });
    }
  });


  router.delete('/deleterequest/:id', async (req, res) => {
    const id = req.params.id;
    try {
      const request= await RequestModel.findByIdAndDelete(id);
      if (!request) {
        return res.status(404).json({
          message: 'Request not found',
        });
      }
      res.status(200).json({
        message: 'Request deleted successfully',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'An error occurred',
      });
    }
  });


router.post('/requestbook', async (req,res) => {

  const {email , name , author , username} = req.body;
  try {
    
    const reqbook = new RequestBook({
      email:email ,
      name:name,
      author:author,
      username:username
    });

    await reqbook.save();
    console.log(reqbook);
    res.status(201).json({
      reqbook,
      message : "Cant request a book"
    })
  
  } catch (error) {
    console.log(error)
   res.status(404).json({
    message : "An error ocurred"
   })
  }
})
  

router.get('/getrequest',async (req,res) => {
  
  try {
      const getreq = await RequestBook.find({});
      res.status(200).json({
        getreq,
        message : "All requests are found"
      })
      
  } catch (error) {
      console.log(error);
      res.status(404).json({
        message :"user request not found"
      })
  }

})

  module.exports = router;