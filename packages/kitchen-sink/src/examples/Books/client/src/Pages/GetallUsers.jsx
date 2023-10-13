import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import Navbar from '../components/Navbar';
const GetallUsers = () => {
  const [users, setUsers] = useState([]);


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/getallUsers');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <>
   <Navbar/>
<div className="container">
      <h2 style={{color:"orange",marginLeft:"500px"}}>User List</h2><br></br>
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>Email</th>
            <th>isAdmin</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.email}</td>
              <td>{user.isAdmin}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
    
  );
};

export default GetallUsers;
