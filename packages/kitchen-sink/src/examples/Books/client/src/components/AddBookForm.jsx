import React, { useState } from 'react';
import { Button, TextField, Paper } from '@mui/material';
import { addBook } from '../api';

function AddBookForm() {
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    const newBook = {
      name,
      author,
      description,
      price,
    };
    const addedBook = await addBook(newBook);
    console.log('Added Book:', addedBook);
    
    setName('');
    setAuthor('');
    setDescription('');
    setPrice('');
   
  }

  return (
    <Paper elevation={3} className="container mt-4 p-4">
      <h2>Add Book</h2>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          variant="outlined"
          className="form-control mb-2"
          value={name}
          onChange={event => setName(event.target.value)}
          fullWidth
        />
        <TextField
          label="Author"
          variant="outlined"
          className="form-control mb-2"
          value={author}
          onChange={event => setAuthor(event.target.value)}
          fullWidth
        />
        <TextField
          label="Description"
          variant="outlined"
          className="form-control mb-2"
          value={description}
          onChange={event => setDescription(event.target.value)}
          fullWidth
          multiline
          rows={4}
        />
        <TextField
          label="Price"
          variant="outlined"
          className="form-control mb-2"
          value={price}
          onChange={event => setPrice(event.target.value)}
          fullWidth
        />
        <Button type="submit" variant="contained" color="primary">
          Add Book
        </Button>
      </form>
    </Paper>
  );
}

export default AddBookForm;
