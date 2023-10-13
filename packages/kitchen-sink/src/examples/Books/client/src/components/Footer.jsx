import React from 'react';

const Footer = () => {
  return (
    <div className='d-flex justify-content-center align-items-center p-3 text-white bg-secondary' style={{ borderTop: '2px solid black' }}>
      <h5>Copyright © {new Date().getFullYear()} Created By <span style={{color:"red"}} >K Bharath Kumar</span></h5>
    </div>
  );
};

export default Footer;
