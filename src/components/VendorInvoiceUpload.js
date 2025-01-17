import React, { useState,useRef } from 'react';
import '../App.css';
import axios from 'axios';
import Navbar from './Navbar';

const baseUrl = process.env.REACT_APP_BASE_URL;

const VendorInvoiceUpload = () => {
  const [uploadType, setUploadType] = useState('new-upload'); 
  const [vendorPanNumber, setVendorPanNumber] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [vendorMap, setVendorMap] = useState([]);
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
  const [pocRecordId, setPocRecordId] = useState('');
  const [pocMap, setPocMap] = useState([]);
  const [verifyInvoice, setVerifyInvoice] = useState('');
  const [verifyPan, setVerifyPan] = useState('');
  const [verifyName, setVerifyName] = useState('');
  const handleChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'vendorPanNumber':
        setVendorPanNumber(value);
        setVendorName('');
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
        pocName(value);
        break;
      case 'ondcContactEmail':
        setOndcContactEmail(value);
        setPocName('')
        break;
      case 'invoiceNumber':
        setInvoiceNumber(value);
        break;
      default:
        break;
    }
  };
  const handlefilter = async(e) =>{
    const { value } = e.target;
    if(value){
    const cleanedValue = value.replace(/\s/g, '');
    try{
      setLoaderforName(true);
      const encodedValue = encodeURIComponent(cleanedValue);
      const response = await axios.get(`${baseUrl}/api/vendor/vendor-info?cleanedValue=${encodedValue}`);
      const vendorData = response.data.data.map((vendor) => ({
        id: vendor.record_id,
        name: vendor['Legal Entity Name'],
      }));
      setVendorMap(vendorData);
    }catch(err){
        console.log(err);
    }
    finally{
      setLoaderforName(false)
    }
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
        const pocData = response.data.data.map((poc) => ({
          id: poc.record_id,
          name: poc.Name,
        }));
        setPocMap(pocData); 
        setPocEmailStatus('');
      } else {
        setPocMap([]); 
        setPocEmailStatus('Please verify POC email ID');
      }
    } catch (err) {
      console.log(err);
      setPocMap([]);
      setPocEmailStatus('Error verifying POC email ID');
    } finally{
      setLoaderforPoc(false);
    }
  };
  const fetchInvoiceData = async () => {
    try {
      setFetching(true);
      const encodedValue = encodeURIComponent(invoiceNumber);
      if(invoiceNumber.trim()){
      const response = await axios.get(`${baseUrl}/api/vendor/get-invoice-data?number=${encodedValue}`);
      if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        const invoiceData = response.data.data[0]; 
        setUpdateRecordId(invoiceData['record_id']);
        setVerifyPan(invoiceData['Vendor PAN'] || '');
        setVerifyName(invoiceData['Vendor']|| '')
        const invoiceDate = invoiceData["Invoice Date"] ? invoiceData["Invoice Date"].split(" ")[0] : '';
        setInvoiceDate(invoiceDate || ''); 
        setPurchaseOrderNumber(invoiceData["PO Number"] || ''); 
        //setOndcContactPoc(invoiceData["ONDC Point of Contact"] || ''); 
        setInvoiceValue(invoiceData["Invoice Value"] || '');
        setVerifyInvoice(invoiceData['Invoice Number'] || '')
        const attachments = JSON.parse(invoiceData["Invoice Attachment"] || '[]');
          if (attachments.length > 0) {
            setFiles(attachments);
            setFilePath(attachments[0].path); 
          }
          if(invoiceData['ONDC Point of Contact']){
            try{
              const encodedValue = encodeURIComponent(invoiceData['ONDC Point of Contact'])
              const pocResponse = await axios.get(`${baseUrl}/api/vendor/get-poc-email?name=${encodedValue}`);
              console.log('response', response)
              if (pocResponse.data.data.length > 0) {
                const poc = pocResponse.data.data[0];
                setOndcContactEmail(poc.Email)
                const pocData = pocResponse.data.data.map((poc) => ({
                  id: poc.record_id,
                  name: poc.Name,
                }));
                setPocMap(pocData); 
                setPocName(poc.Name);
                setPocRecordId(poc.record_id)
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
    if (uploadType === 're-upload' && verifyInvoice !== invoiceNumber) {
      alert("Invoice number is not valid");
      return
    }
    if (uploadType === 're-upload' && verifyPan !== vendorPanNumber && verifyName !== vendorName) {
      alert("Please verify the Vendor Pan and Name");
      return 
    }    
    const encodedValue = encodeURIComponent(invoiceNumber);
    try {
      const invoiceExists = await axios.get(`${baseUrl}/api/vendor/get-invoice-data?number=${encodedValue}`);
      
      if (uploadType === 'new-upload') {
        if (invoiceExists.data.data.length !== 0) {
          alert('This invoice number already exists. Please use a different number.');
          return;
        }
      }
    } catch (error) {
      alert('An error occurred while checking the invoice number. Please try again.');
    }    
    if (!vendorPanNumber || !vendorName || !invoiceDate || !invoiceValue || !purchaseOrderNumber || !pocName) {
      alert("Please fill in all required fields.");
      return;
    }
    else if(files.length === 0){
      alert('please upload the invoice copy')
      return
    }
    else{
    setLoaderSubmit(true)
    const payload = {
      ...(uploadType !== 're-upload' && {
        vendorPanNumber: vendorPanNumber.toUpperCase(),
        vendorName,
      }),
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
    console.log('payload', payload)
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
      console.log('Server response:', res.data);
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
  const handleVendorNameChange = (e) => {
    const selectedVendorId = e.target.value; 
    const selectedVendor = vendorMap.find((vendor) => vendor.id === selectedVendorId);
    setVendorName(selectedVendor ? selectedVendor.name : ''); 
    setRecordID(selectedVendorId); 
  };
  const handlePocNameChange = (event) => {
    const selectedPocName = event.target.value;
    const selectedPoc = pocMap.find((poc) => poc.id === selectedPocName);
    if (selectedPoc) {
      setPocName(selectedPoc.name); 
      setPocRecordId(selectedPoc.id); 
    } else {
      setPocName('');
      setPocRecordId('');
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
    setVendorMap([]);
    setPocMap([]);
    setPocName('');
    setPocRecordId('');
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
          {/* {uploadType === 're-upload' && (<p style={{fontSize:15, marginTop: 5}}>Please enter the invoice number to get the details</p>)} */}
            <div className="grid-container">
              <div className="form-group">
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
                  onChange={handleVendorNameChange}
                >
                 <option value="" disabled>
                  {loaderforName ? 'Getting vendor names...' : 'Select Vendor'}
                </option>
                {!loaderforName &&
                  vendorMap.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                {!loaderforName && vendorMap.length === 0 && (
                  <option value="" disabled>
                    No vendor names available
                  </option>
                )}
                </select>
              </div>
              <div className="form-group">
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
                  value={pocName}
                  onChange={handlePocNameChange}
                >
                <option value="" disabled>
                  {loaderforPoc ? 'Getting POC names...' : 'Select Contact POC'}
                </option>
                {!loaderforPoc &&
                  pocMap.length > 0 &&
                  pocMap.map((poc) => (
                    <option key={poc.id} value={poc.id}>
                      {poc.name}
                    </option>
                  ))}
                {!loaderforPoc && pocMap.length === 0 && (
                  <option value="" disabled>
                    No POCs available
                  </option>
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
