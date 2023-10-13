import React from 'react';
import { Button, Card, CardContent } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { deleteBook } from '../api';

function BookItem({ book }) {
    const navigate = useNavigate();

  async function handleDelete() {
    await deleteBook(book._id);
    console.log('Book Deleted');
  
  }

  return (
    <Card>
      <CardContent>
        <h3>{book.name}</h3>
        <p>Author: {book.author}</p>
       
        <p>Description: {book.description}</p>
        <p>Price: {book.price}</p>
        <Button onClick={() => navigate(`/edit/${book._id}`)}>Edit</Button>
        <Button onClick={handleDelete}>Delete</Button>
      </CardContent>
    </Card>
  );
}

export default BookItem;
