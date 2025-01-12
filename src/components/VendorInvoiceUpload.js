import React, { useState,useRef } from 'react';
import '../App.css';
import axios from 'axios';
import Navbar from './Navbar';

const baseUrl = process.env.REACT_APP_BASE_URL;

const VendorInvoiceUpload = () => {
  const [uploadType, setUploadType] = useState('new-upload'); 
  const [vendorPanNumber, setVendorPanNumber] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [invoiceValue, setInvoiceValue] = useState('');
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState('');
  const [ondcContactPoc, setOndcContactPoc] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const fileInputRef = useRef(null);
  const [pocName, setPocName] = useState('');
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [recordId, setRecordID] = useState('')
  const [loaderSubmit, setLoaderSubmit]= useState(false);
  const [loaderforName, setLoaderforName]= useState(false);
  const [ondcContactEmail, setOndcContactEmail] = useState('');
  const [pocEmailStatus, setPocEmailStatus] = useState('');
  const [loaderforPoc, setLoaderforPoc] = useState(false);
  const [fetching, setFetching] = useState(false); 
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [filePath, setFilePath] = useState('');
  const [updateRecordId, setUpdateRecordId] = useState('')
  const [pocRecordId, setPocRecordId] = useState('')
  console.log('pocName', pocName)
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
      case 'ondcContactEmail':
        setOndcContactEmail(value);
        break;
      case 'invoiceNumber':
        setInvoiceNumber(value);
        break;
      default:
        break;
    }
  };
  const handlefilter = async(e) =>{
    console.log("called")
    const { value } = e.target;
    const cleanedValue = value.replace(/\s/g, '');
    try{
      setLoaderforName(true);
      const encodedValue = encodeURIComponent(cleanedValue);
      const response = await axios.get(`${baseUrl}/api/vendor/vendor-info?cleanedValue=${encodedValue}`);
      console.log(`${baseUrl}/api/vendor/vendor-info?cleanedValue=${encodedValue}`)
      setRecordID(response.data.data[0].record_id)
      setVendorName(response.data.data[0]['Legal Entity Name'])
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
        `${baseUrl}/api/vendor/file-upload`,
        { base64Data, mimeType },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const { msg: { files } } = response.data;
      setFiles(files);
      setFilePath('')
    } catch (error) {
      console.error('Error uploading base64 file:', error);
    } finally {
      setLoading(false);
    }
  };
  const handlePocEmailChange = async (e) => {
    const { value } = e.target;
    setOndcContactEmail(value);
    try {
      setLoaderforPoc(true);
      const verifiedValue = encodeURIComponent(value);
      console.log(verifiedValue)
      const response = await axios.get(`${baseUrl}/api/vendor/poc-name?verifyValue=${verifiedValue}`)
      if (response.data.data.length > 0) {
        const poc = response.data.data[0];
        setPocRecordId(poc.record_id)
        setPocName(poc.Name); 
        setPocEmailStatus('');
      } else {
        setPocName('');
        setPocEmailStatus('Please verify POC email ID');
      }
    } catch (err) {
      console.log(err);
      setPocName('');
      setPocEmailStatus('Error verifying POC email ID');
    } finally{
      setLoaderforPoc(false);
    }
  };
  const fetchInvoiceData = async () => {
    try {
      console.log("Number", invoiceNumber)
      setFetching(true);
      const encodedValue = encodeURIComponent(invoiceNumber);
      console.log(encodedValue)
      if(invoiceNumber.trim()){
      const response = await axios.get(`${baseUrl}/api/vendor/get-invoice-data?number=${encodedValue}`);
      if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        const invoiceData = response.data.data[0]; 
        setUpdateRecordId(invoiceData['record_id']);
        const invoiceDate = invoiceData["Invoice Date"] ? invoiceData["Invoice Date"].split(" ")[0] : '';
        setVendorPanNumber(invoiceData["Vendor PAN"] || ''); 
        setVendorName(invoiceData["Vendor"] || ''); 
        setInvoiceDate(invoiceDate || ''); 
        setPurchaseOrderNumber(invoiceData["PO Number"] || ''); 
        setOndcContactPoc(invoiceData["ONDC Point of Contact"] || ''); 
        setInvoiceValue(invoiceData["Invoice Value"] || '');
        const attachments = JSON.parse(invoiceData["Invoice Attachment"] || '[]');
          if (attachments.length > 0) {
            setFiles(attachments);
            setFilePath(attachments[0].path); 
          }
          if (invoiceData['Vendor PAN']) {
            handlefilter({ target: { value: invoiceData['Vendor PAN'] } });
          }
          if(invoiceData['ONDC Point of Contact']){
            try{
              const encodedValue = encodeURIComponent(invoiceData['ONDC Point of Contact'])
              const response = await axios.get(`${baseUrl}/api/vendor/get-poc-email?name=${encodedValue}`);
              if (response.data.data.length > 0) {
                const poc = response.data.data[0];
                console.log("poc", poc)
                setOndcContactEmail(poc.Email)
                setPocRecordId(poc.record_id)
                setPocName(poc.Name); 
                setPocEmailStatus('');
              } else {
                setPocName('');
                //setPocEmailStatus('');
              }
            }catch(e){
              console.log(e);
            }
          }
      } else {
        alert('No data found for the entered Invoice Value.');
      }
    }
    else{
      alert("Please enter the invoice number")
    }
    } catch (error) {
      alert(`${error}`)
    } finally {
      setFetching(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('uploadType', uploadType)
    if (!vendorPanNumber || !vendorName || !invoiceDate || !invoiceValue || !purchaseOrderNumber || !ondcContactPoc) {
      alert("Please fill in all required fields.");
      return;
    }
    else if(files.length === 0){
      alert('please upload the invoice copy')
    }
    else{
    setLoaderSubmit(true)
    const payload = {
      vendorPanNumber: vendorPanNumber.toUpperCase(),
      vendorName,
      invoiceDate,
      invoiceValue,
      purchaseOrderNumber,
      invoiceNumber,
      ondcContactPocId: pocRecordId,
      ondcContactPocName: pocName,
      files,
      record_id:recordId,
      ...(uploadType === 're-upload' ? { updateRecordId: updateRecordId } : {})
    };
    try {
      const url =
        uploadType === 'new-upload'
          ? `${baseUrl}/api/vendor/upload-invoice`
          : `${baseUrl}/api/vendor/update-invoice`;
      console.log('url', url)
      const res = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(res);
      //console.log('Server response:', response.data);
      setSubmissionStatus('success');
      setTimeout(()=>{
        setSubmissionStatus(null)
      }, 3000)
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmissionStatus('error');
      setTimeout(()=>{
        setSubmissionStatus(null)
      }, 3000)
    }finally{
      setLoaderSubmit(false)
      handleReset()
    }
    }
  };
  
  const handleReset = () => {
    setVendorPanNumber('');
    setVendorName('');
    setInvoiceDate('');
    setInvoiceValue('');
    setPurchaseOrderNumber('');
    setOndcContactPoc('');
    setOndcContactEmail('');
    setInvoiceNumber('');
    setFilePath('');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
  };

  return (
    <div className="main-container">
      <Navbar />
      <div className="main-content">
        <div className="form-container">
        <div className="form-header">
          <h2 className="form-title">Vendor Invoice Upload</h2>
          <select 
            className="upload-type-dropdown"
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value)}
          >
          <option value="new-upload">New Upload</option>
          <option value="re-upload">Re-upload</option>
          </select>
        </div>
          <form onSubmit={handleSubmit} onReset={handleReset} encType="multipart/form-data">
          {uploadType === 're-upload' && (<p style={{fontSize:15, marginTop: 5}}>Please enter the invoice number to get the details</p>)}
            <div className="grid-container">
            <div className="form-group" style={{marginTop:15}}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label htmlFor="invoiceValue">Invoice Number</label>
                <p style={{ color: 'red', margin: '0 0 0 5px', position: 'relative', top: '-3px' }}>*</p>
              </div>  
                <input
                  type="number"
                  id="invoiceNumber"
                  name="invoiceNumber"
                  value={invoiceNumber}
                  onChange={handleChange}
                  //onBlur={uploadType === 're-upload' ? fetchInvoiceData : null} 
                />
                {(!fetching && uploadType === 're-upload') && (
                  <button
                    type="button"
                    onClick={fetchInvoiceData}
                    style={{ marginTop: 10 }}
                  >
                    Fetch Details
                  </button>
                )}
                {fetching && (<p>Fetching the Details...</p>)}
              </div>
              <div className="form-group" style={{marginTop:15}}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label htmlFor="vendorPanNumber">Vendor Pan Number</label>
                  <p style={{ color: 'red', margin: '0 0 0 5px', position: 'relative', top: '-3px' }}>*</p>
                </div>
                <input
                  type="text"
                  id="vendorPanNumber"
                  name="vendorPanNumber"
                  value={vendorPanNumber}
                  onChange={(e) => {
                    handleChange(e);
                }}
                onBlur={(e)=>{
                    handlefilter(e)
                }}
                />
              </div>
              <div className="form-group half-width">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label htmlFor="vendorName">Vendor Name</label>
                <p style={{ color: 'red', margin: '0 0 0 5px', position: 'relative', top: '-3px' }}>*</p>
              </div>  
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
                  (vendorName ? (
                    <option  value={vendorName}>{vendorName}</option>
                  ) : (
                    <option value=""disabled>No vender names available</option>
                  ) )}
                </select>
              </div>
              <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label htmlFor="invoiceDate">Invoice Date</label>
                <p style={{ color: 'red', margin: '0 0 0 5px', position: 'relative', top: '-3px' }}>*</p>
              </div>  
                <input
                  type="date"
                  id="invoiceDate"
                  name="invoiceDate"
                  value={invoiceDate}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label htmlFor="invoiceValue">Invoice Value</label>
                <p style={{ color: 'red', margin: '0 0 0 5px', position: 'relative', top: '-3px' }}>*</p>
              </div>  
                <input
                  type="number"
                  id="invoiceValue"
                  name="invoiceValue"
                  value={invoiceValue}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label htmlFor="invoiceCopy">Upload Invoice Copy</label>
                <p style={{ color: 'red', margin: '0 0 0 5px', position: 'relative', top: '-3px' }}>*</p>
              </div>  
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
                {filePath && (
                  <div style={{ marginTop: 10, color: 'green' }}>
                    <p style={{ marginBottom: '5px' }}><strong>Current file:</strong></p>
                    <p style={{ wordWrap: 'break-word' }}>{filePath}</p>
                  </div>
                )}
              </div>
              <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label htmlFor="purchaseOrderNumber">Purchase Order Number</label>
                <p style={{ color: 'red', margin: '0 0 0 5px', position: 'relative', top: '-3px' }}>*</p>
              </div>  
                <input
                  type="text"
                  id="purchaseOrderNumber"
                  name="purchaseOrderNumber"
                  value={purchaseOrderNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="ondcContactEmail">ONDC Contact Email</label>
                <input
                  type="email"
                  id="ondcContactEmail"
                  name="ondcContactEmail"
                  value={ondcContactEmail}
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  onBlur={(e)=>{
                    handlePocEmailChange(e)
                }}
                />
                {pocEmailStatus && <div style={{ color: 'red', marginTop:'5px' }}>{pocEmailStatus}</div>}
              </div>
              <div className="form-group half-width">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label htmlFor="ondcContactPoc">ONDC Contact POC</label>
                <p style={{ color: 'red', margin: '0 0 0 5px', position: 'relative', top: '-3px' }}>*</p>
              </div>  
                <select
                  id="ondcContactPoc"
                  name="ondcContactPoc"
                  value={ondcContactPoc}
                  onChange={handleChange}
                >
                <option value="" disabled>Select Contact POC</option>
                { loaderforPoc ? (<option disabled>Getting POC name...</option>)
                : 

                (pocName ? (
                  <option value={pocName}>{pocName}</option>
                ) : (
                  <option value=""disabled>No vender names available</option>
                ) )}
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className={loaderSubmit ? 'submit-button-loading': 'submit-button'} disabled={loaderSubmit}>
               {loaderSubmit ? "Submitting....." : "Submit"}
                </button>
              <button type="reset" className="clear-button">Clear</button>
            </div>
            {submissionStatus === 'success' && <div style={{color:'green', fontSize:'18'}}>
            Thank you for uploading your invoice to the system.
            <br></br> 
            <br></br>
            Your invoice is currently being processed and will go through various stages of approval. 
            We will notify you of its status at each stage.
            <br></br>
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
