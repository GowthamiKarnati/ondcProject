import React, { useState,useRef } from 'react';
import '../VendorRegistration.css'
import axios from 'axios';
const baseUrl = 'https://backendforpnf.vercel.app'
const VendorRegistrationForm = () => {
    const fileInputRef = useRef(null);
    const [legalEntityName, setLegalEntityName] = useState('');
    //console.log(legalEntityName);
    const [contactPersonName, setContactPersonName] = useState('');
    const [designation, setDesignation] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [emailId, setEmailId] = useState('');
    const [address, setAddress] = useState('');
    const [state, setState] = useState('');
    const [pinCode, setPinCode] = useState('');
    const [panCardNumber, setPanCardNumber] = useState('');
    const [typeOfEntity, setTypeOfEntity] = useState('');
    const [isMsme, setIsMsme] = useState(null);
    const [isGst, setIsGst] = useState(null);
    const [gstNumber, setGstNumber] = useState('');
    const [bankName, setBankName] = useState('');
    const [beneficiaryName, setBeneficiaryName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [uploading, setUploading] = useState(false);
    const [udyamFiles, setUdyamFiles] = useState([]);
    const [gstFiles, setGstFiles] = useState([]);
    const [cancelledFiles, setCancelledFiles] = useState([]);
    const [gstuploading, setGstUploading] = useState(false);
    const [chequeuploading, setChequeUploading] = useState(false);
    const [interested, setInterested] = useState(null);
    const [notinterested, setNotinterested] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState(null);
    console.log({
        legalEntityName,
        contactPersonName,
        designation,
        contactNumber,
        emailId,
        address,
        state,
        pinCode,
        panCardNumber,
        typeOfEntity,
        isMsme,
        udyamFiles,
        isGst,
        gstFiles,
        gstNumber,
        bankName,
        beneficiaryName,
        accountNumber,
        ifscCode,
        cancelledFiles,
        interested, 
        notinterested
    }); 
console.log({udyamFiles, gstFiles, cancelledFiles})
    const handleInputChange = (setter) => (event) => {
        setter(event.target.value);
    };
    const handleMsmeChange = (event) => {
        console.log("Event", event.target.value === 'yes');
        setIsMsme(event.target.value === 'yes');
    };

    const handleGstChange = (event) => {
        setIsGst(event.target.value === 'yes');
    };
    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
      };
    
      const handleFileChange = async (e, fileType) => {
        const file = e.target.files[0];
        //setInvoiceCopy(file);
        if (file) {
          try {
            const base64File = await convertFileToBase64(file);
            console.log(base64File, file.type)
            await uploadBase64ToBackend(base64File, file.type, fileType);
          } catch (error) {
            console.error('Error converting file to Base64:', error);
          }
        }
      };
    
      const uploadBase64ToBackend = async (base64Data, mimeType, fileType) => {
        try {
            switch(fileType){
                case 'udyam':setUploading(true); break;
                case 'gst': setGstUploading(true); break;
                case 'cheque': setChequeUploading(true); break; 
            }
          
          const response = await axios.post(
            `${baseUrl}/vendorfileUpload`,
            { base64Data, mimeType },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          const { msg: { files } } = response.data;
          console.log(response.data);
          switch (fileType) {
            case 'udyam':
                setUdyamFiles(files);
                break;
            case 'gst':
                setGstFiles(files);
                break;
            case 'cheque':
                setCancelledFiles(files);
                break;
            default:
                break;
        }
        } catch (error) {
          console.error('Error uploading base64 file:', error);
        } finally {
            switch(fileType){
                case 'udyam':setUploading(false); break;
                case 'gst': setGstUploading(false); break;
                case 'cheque': setChequeUploading(false); break; 
            }
        }
      };
    const handleSubmit = async(e) =>{
        e.preventDefault();
        setIsSubmitting(true);
        const data = {
            legalEntityName,
            contactPersonName,
            designation,
            contactNumber,
            emailId,
            address,
            state,
            pinCode,
            panCardNumber,
            typeOfEntity,
            isMsme,
            udyamFiles,
            isGst,
            gstFiles,
            gstNumber,
            bankName,
            beneficiaryName,
            accountNumber,
            ifscCode,
            cancelledFiles,
            interested, 
            notinterested
        }
        try{
            const response = await axios.post(`${baseUrl}/createvendor`, 
                data,
                {
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  }
            )
            console.log(response.data)
            setSubmissionStatus('success');
        }
        catch(err){
            console.log("Error", err)
            setSubmissionStatus('error')
            setTimeout(()=>{
                setSubmissionStatus(null)
            }, 3000)
        }finally{
            setIsSubmitting(false);
            setLegalEntityName('');
            setContactPersonName('');
            setDesignation('');
            setContactNumber('');
            setEmailId('');
            setAddress('');
            setState('');
            setPinCode('');
            setPanCardNumber('');
            setTypeOfEntity('');
            setIsMsme(null);
            setIsGst(null);
            setGstNumber('');
            setBankName('');
            setBeneficiaryName('');
            setAccountNumber('');
            setIfscCode('');
            setUdyamFiles([]);
            setGstFiles([]);
            setCancelledFiles([]);
            setInterested(null);
            setNotinterested(null)
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            
        }

    }
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
        <div className="form-container">
            <h2 className="form-title">Vendor Registration Form</h2>
            <form id="business-partner-form" onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="form-row">
                    <div className="input-group">
                        <div className="form-group">
                            <label htmlFor="legal-entity-name" className="form-label" style={{ fontWeight: '700' }}>Legal Entity Name</label>
                            <input
                                type="text"
                                id="legal-entity-name"
                                name="legal-entity-name"
                                className="form-input"
                                placeholder="Cheque will be issued in this name"
                                value={legalEntityName}
                                onChange={handleInputChange(setLegalEntityName)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="contact-person-name" className="form-label">Contact Person Name</label>
                            <input
                                type="text"
                                id="contact-person-name"
                                name="contact-person-name"
                                className="form-input"
                                value={contactPersonName}
                                onChange={handleInputChange(setContactPersonName)}
                            />
                        </div>
                    </div>
                    <div className="input-group">
                        <div className="form-group">
                            <label htmlFor="designation" className="form-label">Designation</label>
                            <input
                                type="text"
                                id="designation"
                                name="designation"
                                className="form-input"
                                value={designation}
                                onChange={handleInputChange(setDesignation)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="contact-number" className="form-label">Contact Number</label>
                            <input
                                type="text"
                                id="contact-number"
                                name="contact-number"
                                className="form-input"
                                value={contactNumber}
                                onChange={handleInputChange(setContactNumber)}
                            />
                        </div>
                    </div>
                    <div className="input-group">
                        <div className="form-group">
                            <label htmlFor="email-id" className="form-label">Email ID</label>
                            <input
                                type="email"
                                id="email-id"
                                name="email-id"
                                className="form-input"
                                value={emailId}
                                onChange={handleInputChange(setEmailId)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="address" className="form-label">Address</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                className="form-input"
                                value={address}
                                onChange={handleInputChange(setAddress)}
                            />
                        </div>
                    </div>
                    <div className="input-group">
                        <div className="form-group">
                            <label htmlFor="state" className="form-label">State</label>
                            <input
                                type="text"
                                id="state"
                                name="state"
                                className="form-input"
                                value={state}
                                onChange={handleInputChange(setState)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="pin-code" className="form-label">Pin Code</label>
                            <input
                                type="text"
                                id="pin-code"
                                name="pin-code"
                                className="form-input"
                                value={pinCode}
                                onChange={handleInputChange(setPinCode)}
                            />
                        </div>
                    </div>
                    <div className="input-group">
                        <div className="form-group">
                            <label htmlFor="pan-card-number" className="form-label">PAN Card Number</label>
                            <input
                                type="text"
                                id="pan-card-number"
                                name="pan-card-number"
                                className="form-input"
                                value={panCardNumber}
                                onChange={handleInputChange(setPanCardNumber)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="type-of-entity" className="form-label">Type of Entity</label>
                            <select
                                id="type-of-entity"
                                name="type-of-entity"
                                className="form-input"
                                value={typeOfEntity}
                                onChange={handleInputChange(setTypeOfEntity)}
                            >
                                <option value="private-limited">Private Limited</option>
                                <option value="public-limited">Public Limited</option>
                                <option value="llp">LLP</option>
                                <option value="sole-proprietorship">Sole Proprietorship</option>
                                <option value="partnership">Partnership</option>
                                <option value="huf">HUF</option>
                                <option value="section-8">Section 8</option>
                                <option value="societies">Societies</option>
                                <option value="trust">Trust</option>
                                <option value="self-help-group">Self Help Group</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                    <div className="form-question">
                        <div className="form-question-label">
                            Are you registered under Micro, Small & Medium Enterprise Development Act, 2006?
                        </div>
                        <div className="form-radio-group">
                            <div className="form-radio-option">
                                <input 
                                id="msme-yes" 
                                name="msme" 
                                type="radio" 
                                value="yes" 
                                onChange={handleMsmeChange} 
                                className="form-radio-input" 
                                checked={isMsme === true}
                                />
                                <label htmlFor="msme-yes" className="form-radio-label">Yes</label>
                            </div>
                            <div className="form-radio-option">
                                <input 
                                id="msme-no" 
                                name="msme" 
                                type="radio" 
                                value="no" 
                                onChange={handleMsmeChange} 
                                className="form-radio-input" 
                                checked={isMsme === false}
                                />
                                <label htmlFor="msme-no" className="form-radio-label">No</label>
                            </div>
                        </div>
                    </div>
                </div>
                    {isMsme && (
                        <div className="form-group" id="udyam-upload-section">
                            <label htmlFor="udyam-certificate" className="form-label">Upload UDYAM Certificate</label>
                            <input 
                            type="file" 
                            id="udyam-certificate" 
                            name="udyam-certificate" 
                            className="form-file-input" 
                            //ref={fileInputRef}
                            onChange={(e) => {
                                handleFileChange(e, 'udyam');
                              }}
                            />
                            {uploading && <div style={{color:'green', marginBottom:'10px'}}>Uploading...</div>}
                        </div>
                    )}
                    <div className="form-group">
                    <div className="form-question">
                    <div className="form-question-label">
                        Are you registered under GST?
                        </div>
                            <div className="form-radio-group">
                                <div className="form-radio-option">
                                    <input
                                    id="gst-yes" 
                                    name="gst" 
                                    type="radio" 
                                    value="yes" 
                                    onChange={handleGstChange} 
                                    className="form-radio-input"
                                    checked={isGst === true} 
                                    />
                                    <label htmlFor="gst-yes" className="form-radio-label">Yes</label>
                                </div>
                                <div className="form-radio-option">
                                    <input 
                                    id="gst-no" 
                                    name="gst" 
                                    type="radio" 
                                    value="no" 
                                    onChange={handleGstChange} 
                                    className="form-radio-input" 
                                    checked={isGst === false}
                                    />
                                    <label htmlFor="gst-no" className="form-radio-label">No</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    {isGst && (
                        <div className="form-group" id="gst-upload-section">
                            <label htmlFor="gst-certificate" className="form-label">Upload GST Certificate</label>
                            <input type="file" 
                            id="gst-certificate" 
                            name="gst-certificate" 
                            className="form-file-input" 
                            //ref={fileInputRef}
                            onChange={(e) => {
                                handleFileChange(e, 'gst');
                              }}
                            />
                            {gstuploading && <div style={{color:'green'}}>Uploading...</div>}
                            <label htmlFor="gst-number" className="form-label mt-4">GST Registration Number</label>
                            <input
                                type="text"
                                id="gst-number"
                                name="gst-number"
                                className="form-input"
                                value={gstNumber}
                                onChange={handleInputChange(setGstNumber)}
                            />
                        </div>
                    )}
                    <div className="input-group">
                    <div className="form-group">
                        <label htmlFor="bank-name" className="form-label">Bank Name</label>
                        <input
                                type="text"
                                id="bank-name"
                                name="bank-name"
                                className="form-input"
                                value={bankName}
                                onChange={handleInputChange(setBankName)}
                            />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="beneficiary-name" className="form-label">Beneficiary Name</label>
                        <input
                                type="text"
                                id="beneficiary-name"
                                name="beneficiary-name"
                                className="form-input"
                                value={beneficiaryName}
                                onChange={handleInputChange(setBeneficiaryName)}
                            />
                    </div>
                    </div>
                    <div className="input-group">
                    <div className="form-group">
                        <label htmlFor="account-number" className="form-label">Account Number</label>
                        <input
                                type="text"
                                id="account-number"
                                name="account-number"
                                className="form-input"
                                value={accountNumber}
                                onChange={handleInputChange(setAccountNumber)}
                            />
                    </div>
                    <div className="form-group">
                        <label htmlFor="ifsc-code" className="form-label">IFSC Code</label>
                        <input
                                type="text"
                                id="ifsc-code"
                                name="ifsc-code"
                                className="form-input"
                                value={ifscCode}
                                onChange={handleInputChange(setIfscCode)}
                            />
                    </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="cancelled-cheque" className="form-label">Cancelled Cheque</label>
                        <input 
                        type="file" 
                        id="cancelled-cheque" 
                        name="cancelled-cheque" 
                        className="form-file-input" 
                        ref={fileInputRef}
                        onChange={(e) => {
                            handleFileChange(e, 'cheque');
                          }}
                        />
                        {chequeuploading && <div style={{color:'green'}}>Uploading...</div>}
                    </div>
                    <div class="col-span-1 md:col-span-2">
                        <div class ="form-question-label">
                            Business Partner Code of Conduct
                            </div>
                            <div class="form-radio-group">
                                <div class="form-radio-option">
                                    <input 
                                        id="bp-code-yes" 
                                        name="bp-code" 
                                        type="radio" 
                                        value="yes" 
                                        class="code-of-conduct-radio"
                                        checked ={interested === true}
                                        onChange={(e)=>{
                                            setInterested(e.target.value === 'yes')
                                            setNotinterested(e.target.value === 'no')
                                        }}
                                    />
                                    <label 
                                        for="bp-code-yes" 
                                        style={{color:'black', marginLeft:'15px', fontSize:'15px'}}
                                    >
                                        I have read and understood the Business Partner Code of Conduct uploaded on the link above and hereby accept to abide by the same throughout the period of partnership with ONDC
                                    </label>
                                </div>
                                <div class="form-radio-option">
                                    <input 
                                        iid="bp-code-yes" 
                                        name="bp-code" 
                                        type="radio" 
                                        value="yes" 
                                        class="code-of-conduct-radio"
                                        checked={notinterested === true}
                                        onChange={(e)=>{
                                            setNotinterested(e.target.value === 'yes')
                                            setInterested(e.target.value === 'no')
                                        }}
                                    />
                                    <label 
                                        for="bp-code-no" 
                                        style={{color:'black', marginLeft:'15px',fontSize:'15px'}}
                                    >
                                        I have read and understood the Business Partner Code of Conduct uploaded on the link above and have my reservations in complying with the same. Hence, I do not wish to continue with the partnership with ONDC
                                    </label>
                                </div>
                            </div>
                        
                    </div>
                    <div className="form-group">
                        <button type="submit" className="form-submit-button" disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Submit"}
                            </button>
                    </div>
                    {submissionStatus === 'success' && <div style={{color:'green'}}>
                    Vendor Registration Details Successfully Submitted!
                    <br></br>
                    <br></br>
                     Thank you for providing your vendor registration details. 
                     Your information has been successfully captured and recorded in our system. 
                     We will review the submitted details and get back to you if any additional information is needed. 
                     Please keep an eye on your email for further communication from our team. 
                     If you have any immediate questions or concerns, feel free to contact our support team.
                        </div>}
                    {submissionStatus === 'error' && <div style={{color:'red'}}>Error submitting form. Please try again.</div>}
                </div>
            </form>
        </div>
        </div>
    );
};

export default VendorRegistrationForm;

