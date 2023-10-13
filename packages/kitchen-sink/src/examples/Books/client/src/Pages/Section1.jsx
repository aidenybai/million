import React from 'react';

const Section1 = () => {
  return (
    <div className="section d-flex flex-column align-items-center" id="section1" style={{ height: "1000px", color: "gold", fontSize: "50px", background: "url('https://i.ibb.co/CWrg0T4/Sunset-Skydive-wallpaper-parachute-sports-parachute-wallpaper-Wallpapers-Download.jpg') no-repeat center center fixed", backgroundSize: "cover" , maxHeight:"100vh"}}>
      
      <div className="text-center" style={{ marginTop: "250px" }}>
        <h1 style={{ color: "white" }}>Welcome to<span style={{ color: "red" }}> Books Store</span></h1>
        <p style={{ color: "black" }}>You can read your interested<span style={{ color: "gold" }}>Books</span></p>
      </div>
      <div style={{ marginLeft: "-400px" }}></div>
    </div>
  );
};

export default Section1;
