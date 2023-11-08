import React, { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import { block } from 'million/react';

const GithubUserSearch = block(() => {
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState('');
  const [error, setError] = useState(null);

  const getUserDetails = (user) => {
    const apiURL = 'https://api.github.com/users/' + user;
    axios
      .get(apiURL)
      .then((response) => {
        console.log(response.data);
        setUserData(response.data);
        setError(null);
      })
      .catch((err) => {
        console.log(err);
        setError('User not found');
        setUserData(null); // Use null for userData on error
      });
  };

  const userNameHandler = (e) => {
    setUser(e.target.value);
  };

  const search = () => {
    getUserDetails(user);
  };

  return (
    <div className="container">
      <div className="kl">
        <div className="input-container">
          <input
            type="text"
            className="input-field"
            onChange={userNameHandler}
            value={user}
            placeholder="Enter a GitHub username"
          />
          <button className="search-button" onClick={search}>
            Search
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
        {userData && (
          <div className="user-details">
            <h2 className="username">UserName: {userData.login}</h2>
            <h2 className="name">Name: {userData.name}</h2>
            <h2 className="bio">{userData.bio}</h2>
            <h2 className="location">Location: {userData.location}</h2>
            <h3>Following: {userData.following}</h3>
            <h3>Followers: {userData.followers}</h3>
          </div>
        )}
      </div>
    </div>
  );
});

export default GithubUserSearch;
