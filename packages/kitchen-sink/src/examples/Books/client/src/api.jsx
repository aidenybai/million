import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api/books',
});

export const getAllBooks = async () => {
  const response = await instance.get('/getall');
  return response.data.books; 
};

export const addBook = async (newBook) => {
  const response = await instance.post('/addBook', newBook);
  return response.data.newBook; 
};

export const getBookById = async (id) => {
  const response = await instance.get(`/getBook/${id}`);
  return response.data.book; 
};

export const updateBook = async (id, updatedBook) => {
  const response = await instance.put(`/update/${id}`, updatedBook);
  return response.data.book; 
};

export const deleteBook = async (id) => {
  const response = await instance.delete(`/delete/${id}`);
  return response.data.message; 
};
