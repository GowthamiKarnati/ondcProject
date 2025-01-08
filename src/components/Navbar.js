import React from 'react'

function Navbar() {
  return (
    <>
     <nav className="navbar">
        <div className="container">
        <span className="title">Vendor Portal</span>
        <a href="https://ondc.org/assets/theme/images/ondc_registered_logo.svg?v=bfe185127c" target="_blank" rel="noopener noreferrer" className="logo">
            <img src="https://ondc.org/assets/theme/images/ondc_registered_logo.svg?v=bfe185127c" alt="ONDC Logo" />
        </a>
        </div>
    </nav>
    </>
  )
}

export default Navbar