import React from 'react'

function ErrorMessage({message}:any) {
  return (
<div style={{backgroundColor: "#804a09", padding: "1rem", boxSizing: "border-box", borderRadius: "1.3em", color: "#ffb3b3", fontSize: ".96rem", fontWeight: "500"}}>{message}</div>
    
  )
}

export default ErrorMessage;