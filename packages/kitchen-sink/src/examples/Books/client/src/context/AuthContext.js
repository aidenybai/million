import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [userEmail, setUserEmail] = useState(null);

  // Function to set the user's email after successful login
  function login(email) {
    setUserEmail(email);
  }

  // Function to log the user out


  const value = {
    userEmail,
    login,
    
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
