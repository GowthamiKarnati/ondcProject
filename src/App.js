import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import VendorInvoiceUpload from './components/VendorInvoiceUpload';
import VendorRegistration from './components/VendorRegistration';

function App() {
  console.log(process.env.REACT_APP_BASE_URL)
  return (
    <Router>
      <Routes>
        <Route path ='/' /> 
        <Route path="/invoice-upload" element={<VendorInvoiceUpload />} />
        <Route path="/register" element={<VendorRegistration />} />
      </Routes>
    </Router>
  );
}

export default App;
