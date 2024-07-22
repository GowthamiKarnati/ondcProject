import React, { useState,useRef } from 'react';
import '../App.css';
import axios from 'axios';
const baseUrl = 'https://backendforpnf.vercel.app'
//const baseUrl = 'http://localhost:5002'
const VendorInvoiceUpload = () => {
  // State variables for each form field
  const [vendorPanNumber, setVendorPanNumber] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [invoiceValue, setInvoiceValue] = useState('');
  const [invoiceCopy, setInvoiceCopy] = useState(null);
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState('');
  const [ondcContactPoc, setOndcContactPoc] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const fileInputRef = useRef(null);
  const [vendorNames, setVendorNames] = useState('');
  const [pocName, setPocName] = useState([]);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [recordId, setRecordID] = useState('')
  const [loaderSubmit, setLoaderSubmit]= useState(false);
  const [loaderforName, setLoaderforName]= useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'vendorPanNumber':
        setVendorPanNumber(value);

        break;
      case 'vendorName':
        setVendorName(value);
        break;
      case 'invoiceDate':
        setInvoiceDate(value);
        break;
      case 'invoiceValue':
        setInvoiceValue(value);
        break;
      case 'purchaseOrderNumber':
        setPurchaseOrderNumber(value);
        break;
      case 'ondcContactPoc':
        setOndcContactPoc(value);
        break;
      default:
        break;
    }
  };
  const handlefilter = async(e) =>{
    const { value } = e.target;
    const cleanedValue = value.replace(/\s/g, '');
   //console.log("value", cleanedValue);
   try{
    setLoaderforName(true);
    const encodedValue = encodeURIComponent(cleanedValue);
    //console.log("Encoded", encodedValue);
    const response = await axios.get(`${baseUrl}/vendor?cleanedValue=${encodedValue}`);
    setRecordID(response.data.data[0].record_id)
    const dept = response.data.data[0]['Dept'];
    setVendorNames(response.data.data[0]['Legal Entity Name'])
    const encodedDept = encodeURIComponent(dept)
    const responseforOndc = await axios.get(`${baseUrl}/vendordept?dept=${encodedDept}`);
    //console.log(responseforOndc.data.data);
    const ondcNames= responseforOndc.data.data.map(dept=> ({id: dept.record_id, value: dept.Name}))
    setPocName(ondcNames);
   }catch(err){
      console.log(err);
   }
   finally{
    setLoaderforName(false)
   }
  }

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setInvoiceCopy(file);
    if (file) {
      try {
        const base64File = await convertFileToBase64(file);
        await uploadBase64ToBackend(base64File, file.type);
      } catch (error) {
        console.error('Error converting file to Base64:', error);
      }
    }
  };

  const uploadBase64ToBackend = async (base64Data, mimeType) => {
    try {
      setLoading(true);
      const response = await axios.post(
        'https://backendforpnf.vercel.app/vendorfileUpload',
        { base64Data, mimeType },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const { msg: { files } } = response.data;
      setFiles(files);
    } catch (error) {
      console.error('Error uploading base64 file:', error);
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) { // Prevent form submission while file is uploading
        alert("Please wait until the file upload is complete.");
        return;
      }
    setLoaderSubmit(true)
    let ondcContactPOCInfo = { id: '', value: '' };
  
  try {
    if (ondcContactPoc) {
      ondcContactPOCInfo = JSON.parse(ondcContactPoc);
    }
  } catch (error) {
    console.error('Error parsing ONDC Contact POC:', error);
    setSubmissionStatus('error');
    return;
  }
    const payload = {
      vendorPanNumber: vendorPanNumber.toUpperCase(),
      vendorName,
      invoiceDate,
      invoiceValue,
      purchaseOrderNumber,
      ondcContactPocId: ondcContactPOCInfo.id,
      ondcContactPocName: ondcContactPOCInfo.value,
      files,
      record_id:recordId
    };

    try {
      const response = await axios.post(
        'https://backendforpnf.vercel.app/createvendorinvoice',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Server response:', response.data);
      setSubmissionStatus('success');
      
      setTimeout(()=>{
        setSubmissionStatus(null)
        handleReset()
      }, 2000)
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmissionStatus('error');
      setTimeout(()=>{
        setSubmissionStatus(null)
      }, 3000)
    }finally{
      setLoaderSubmit(false)
    }
  };

  const handleReset = () => {
    // Reset individual state variables for form fields
    setVendorPanNumber('');
    setVendorName('');
    setInvoiceDate('');
    setInvoiceValue('');
    setInvoiceCopy(null);
    setPurchaseOrderNumber('');
    setOndcContactPoc('');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
  };

  return (
    <div className="main-container">
      <nav className="navbar">
        <div className="container">
          <span className="title">Vendor Portal</span>
          <a href="https://ondc.org/assets/theme/images/ondc_registered_logo.svg?v=bfe185127c" target="_blank" rel="noopener noreferrer" className="logo">
            <img src="https://ondc.org/assets/theme/images/ondc_registered_logo.svg?v=bfe185127c" alt="ONDC Logo" />
          </a>
        </div>
      </nav>
      <div className="main-content">
        <div className="form-container">
          <h2 className="form-title">Vendor Invoice Upload</h2>
          <form onSubmit={handleSubmit} onReset={handleReset} encType="multipart/form-data">
            <div className="grid-container">
              <div className="form-group">
                <label htmlFor="vendorPanNumber">Vendor Pan Number</label>
                <input
                  type="text"
                  id="vendorPanNumber"
                  name="vendorPanNumber"
                  value={vendorPanNumber}
                  onChange={(e) => {
                    handleChange(e);
                    //handlefilter(e);
                }}
                onBlur={(e)=>{
                    handlefilter(e)
                }}
                />
              </div>
              <div className="form-group half-width">
                <label htmlFor="vendorName">Vendor Name</label>
                <select
                  id="vendorName"
                  name="vendorName"
                  value={vendorName}
                  onChange={handleChange}
                >
                  <option value="" disabled >Select Vendor</option>
                  {loaderforName ? 
                  (<option disabled>Getting vendor name...</option>)
                  :
                  (vendorNames ? (
                    <option  value={vendorNames}>{vendorNames}</option>
                  ) : (
                    <option value=""disabled>No vender names available</option>
                  ) )}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="invoiceDate">Invoice Date</label>
                <input
                  type="date"
                  id="invoiceDate"
                  name="invoiceDate"
                  value={invoiceDate}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="invoiceValue">Invoice Value</label>
                <input
                  type="number"
                  id="invoiceValue"
                  name="invoiceValue"
                  value={invoiceValue}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="invoiceCopy">Upload Invoice Copy</label>
                
                <input
                  type="file"
                  id="invoiceCopy"
                  name="invoiceCopy"
                  ref={fileInputRef}
                  onChange={(e) => {
                    handleFileChange(e);
                  }}
                />
                {loading && <div style={{color:'green'}}>Uploading...</div>}
              </div>
              <div className="form-group">
                <label htmlFor="purchaseOrderNumber">Purchase Order Number</label>
                <input
                  type="text"
                  id="purchaseOrderNumber"
                  name="purchaseOrderNumber"
                  value={purchaseOrderNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group half-width">
                <label htmlFor="ondcContactPoc">ONDC Contact POC</label>
                <select
                  id="ondcContactPoc"
                  name="ondcContactPoc"
                  value={ondcContactPoc}
                  onChange={handleChange}
                >
                  <option value="">Select Contact POC</option>
                  {pocName?.length > 0 ? 
                  (pocName?.map((poc, index) => (
                    <option key={index} value={JSON.stringify(poc)}>{poc.value}</option>
                  ))): (
                    <option value="">No POC avaliable</option>
                  )}
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className={loaderSubmit ? 'submit-button-loading': 'submit-button'} disabled={loaderSubmit}>
               {loaderSubmit ? "Submitting....." : "Submit"}
                </button>
              <button type="reset" className="clear-button">Clear</button>
            </div>
            {submissionStatus === 'success' && <div style={{color:'green'}}>
            Thank you for uploading your invoice to the system. 
            Your invoice is currently being processed and will go through various stages of approval. 
            We will notify you of its status at each stage.
            Thank you for your patience.
                </div>}
            {submissionStatus === 'error' && <div style={{color:'red'}}>Error submitting form. Please try again.</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default VendorInvoiceUpload;
