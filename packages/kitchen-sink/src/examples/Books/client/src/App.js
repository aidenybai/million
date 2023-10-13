import React from 'react';
import { BrowserRouter , Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './Pages/Home';
import Books from './Pages/Books';
import AddBooks from './Pages/AddBooks';
import Footer from './components/Footer';
import Update from './Pages/Update';
import Login from './Pages/Login';
import Register from './Pages/Register';
import UserPage from './Pages/UserPage';
import LandingScreen from './Pages/LandingScreen';
import Section1 from './Pages/Section1';
import Section2 from './Pages/Section2';
import Section3 from './Pages/Section3';
import GetallUsers from './Pages/GetallUsers';
import GetRequest from './Pages/GetRequests';
import RequestBooks from './Pages/RequestBooks';
import SearchBooks from './Pages/SearchBooks';
import ForgotPassword from './Pages/ForgotPassword'
// import { AuthProvider } from './context/AuthContext';
function App() {
  return (
    <>
    <BrowserRouter>
    
    <Routes>
          

          <Route path="/" element = {<LandingScreen/>}/>
           <Route path="/userpage" element={<UserPage/>}/>
        <Route path="/searchbook" element = {<SearchBooks/>}/>
        <Route path="/requestbook" element={<RequestBooks/>}/>
      <Route path="/getrequest" element={<GetRequest/>}/>
         <Route  path="/register" element={<Register />} />
        <Route  path="/login" element={<Login />} />
        <Route path="getallusers" element={<GetallUsers/>}/>
          <Route path="/getall" element={<Books/>}/>
          <Route path="/addBook" element={<AddBooks/>}/>
          <Route path="/section1" element = {<Section1/>}/>
          <Route path="/section2" element={<Section2/>}/>
          <Route path="/section3" element={<Section3/>}/>
          <Route path="/update/:_id" element={<Update />} />
          <Route path="/forgot-password" element={<ForgotPassword/>}/>
          <Route exact path="/home"  element={<Home/>}/>
          
          </Routes>
      </BrowserRouter>
      </>
  );
}

export default App;
