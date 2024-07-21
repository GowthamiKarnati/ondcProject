import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import VendorInvoiceUpload from './components/VendorInvoiceUpload';
import VendorRegistration from './components/VendorRegistration';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VendorInvoiceUpload />} />
        <Route path="/register" element={<VendorRegistration />} />
      </Routes>
    </Router>
  );
}

export default App;
