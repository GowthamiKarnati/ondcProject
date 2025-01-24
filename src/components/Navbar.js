import React from 'react';
import "../App.css";
const styles = {
  whiteLogo: {
    filter: 'invert(1) brightness(8)',
    size: 100
  },
};
function Navbar() {
  return (
    <>
     <nav className="navbar">
        <div className="container">
        <span className="title">Vendor Portal</span>
        <a href="https://ondc.org" target="_blank" rel="noopener noreferrer" className="logo">
            <img src="https://ondc.org/assets/theme/images/ondc_registered_logo.svg?v=bfe185127c" alt="ONDC Logo" style={styles.whiteLogo} />
        </a>
        </div>
    </nav>
    </>
  )
}

export default Navbar