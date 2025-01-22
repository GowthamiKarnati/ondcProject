import React, { useState, useRef } from "react";
import "../VendorRegistration.css";
import axios from "axios";
import InputFeild from "./InputFeild";
import Navbar from "./Navbar";
import TypeOfEntity from "./TypeofEntity";
import { convertFileToBase64 } from "../utilities/fileUtils";
import { uploadBase64ToBackend } from "../utilities/utils";
import { toTitleCase } from "../utilities/toTitleCase";

const VendorRegistrationForm = () => {
	const fileInputRef = useRef(null);
	const panFileInputRef = useRef(null);
	const [legalEntityName, setLegalEntityName] = useState("");
	const [contactPersonName, setContactPersonName] = useState("");
	const [designation, setDesignation] = useState("");
	const [contactNumber, setContactNumber] = useState("");
	const [emailId, setEmailId] = useState("");
	const [address, setAddress] = useState("");
	const [state, setState] = useState("");
	const [pinCode, setPinCode] = useState("");
	const [panCardNumber, setPanCardNumber] = useState("");
	const [typeOfEntity, setTypeOfEntity] = useState("");
	const [isMsme, setIsMsme] = useState(null);
	const [isGst, setIsGst] = useState(null);
	const [gstNumber, setGstNumber] = useState("");
	const [bankName, setBankName] = useState("");
	const [beneficiaryName, setBeneficiaryName] = useState("");
	const [accountNumber, setAccountNumber] = useState("");
	const [ifscCode, setIfscCode] = useState("");
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
	const [tradeName, setTradeName] = useState("");
	const [cinNo, setCinNo] = useState("");
	const [uploadCoi, setUploadCoi] = useState(false);
	const [CoiFile, setCoiFiles] = useState([]);
	const [msmeNumber, setMsmeNumber] = useState("");
	const [panCard, setPanCard] = useState([]);
	const [panCardUpload, setPanCardUpload] = useState(false);
	const handleInputChange = (setter) => (event) => {
		setter(event.target.value);
	};
	const handleMsmeChange = (event) => {
		setIsMsme(event.target.value === "yes");
	};

	const handleGstChange = (event) => {
		setIsGst(event.target.value === "yes");
	};

	const handleFileChange = async (e, fileType) => {
		const file = e.target.files[0];
		if (file) {
			try {
				const base64File = await convertFileToBase64(file);
				switch (fileType) {
					case "udyam":
						setUploading(true);
						break;
					case "gst":
						setGstUploading(true);
						break;
					case "cheque":
						setChequeUploading(true);
						break;
					case "coi":
						setUploadCoi(true);
						break;
					case "pan":
						setPanCardUpload(true);
						break;
					default:
						break;
				}
				const {
					msg: { files },
				} = await uploadBase64ToBackend(base64File, file.type);
				switch (fileType) {
					case "udyam":
						setUdyamFiles(files);
						break;
					case "gst":
						setGstFiles(files);
						break;
					case "cheque":
						setCancelledFiles(files);
						break;
					case "coi":
						setCoiFiles(files);
						break;
					case "pan":
						setPanCard(files);
						break;
					default:
						break;
				}
			} catch (error) {
				console.error("Error uploading base64 file:", error);
			} finally {
				switch (fileType) {
					case "udyam":
						setUploading(false);
						break;
					case "gst":
						setGstUploading(false);
						break;
					case "cheque":
						setChequeUploading(false);
						break;
					case "coi":
						setUploadCoi(false);
						break;
					case "pan":
						setPanCardUpload(false);
						break;
					default:
						break;
				}
			}
		}
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (
			!legalEntityName ||
			!contactPersonName ||
			!designation ||
			!contactNumber ||
			!emailId ||
			!address ||
			!state ||
			!pinCode ||
			!panCardNumber ||
			!typeOfEntity ||
			!bankName ||
			!beneficiaryName ||
			!accountNumber ||
			!ifscCode
		) {
			alert("Please fill all required fields.");
			return;
		}
		if (["Private Limited", "Public Limited", "Section 8"].includes(typeOfEntity)) {
			if (!cinNo) {
				alert("Please provide the CIN No.");
				return;
			}
			if (CoiFile.length === 0) {
				alert("Please upload the Certificate of Incorporation (COI).");
				return;
			}
		}
		if (isMsme === null) {
			alert("Please select whether you are registered under the MSME Act.");
			return;
		}
		if (isGst === null) {
			alert("Please select whether you are registered GST.");
			return;
		}
		if (isMsme && (!msmeNumber || udyamFiles.length === 0)) {
			if (!msmeNumber) {
				alert("Please enter your MSME Registration Number.");
				return;
			}
			alert("Please upload the required MSME certificate.");
			return;
		}
		if (isGst && (!gstNumber || gstFiles.length === 0)) {
			if (!gstNumber) {
				alert("Please enter your GST Registration Number ");
				return;
			}
			alert("Please upload the required GST certificate.");
			return;
		}
		console.log("cancelledFiles", cancelledFiles);
		if (cancelledFiles.length === 0 || panCard.length === 0) {
			alert("Please upload the file.");
			return;
		}
		setIsSubmitting(true);
		const data = {
			legalEntityName: toTitleCase(legalEntityName),
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
			// interested,
			// notinterested,
			tradeName,
			cinNo,
			CoiFile,
			msmeNumber,
			panCard,
		};
		try {
			await axios.post(`/api/vendor/create`, data, {
				headers: {
					"Content-Type": "application/json",
				},
			});

			setSubmissionStatus("success");
			setTimeout(() => {
				setSubmissionStatus(null);
			}, 4000);
		} catch (err) {
			console.error("Error:", err);
			setSubmissionStatus("error");
			setTimeout(() => {
				setSubmissionStatus(null);
			}, 5000);
		} finally {
			setIsSubmitting(false);
			setLegalEntityName("");
			setContactPersonName("");
			setDesignation("");
			setContactNumber("");
			setEmailId("");
			setAddress("");
			setState("");
			setPinCode("");
			setPanCardNumber("");
			setTypeOfEntity("");
			setIsMsme(null);
			setIsGst(null);
			setGstNumber("");
			setBankName("");
			setBeneficiaryName("");
			setAccountNumber("");
			setIfscCode("");
			setUdyamFiles([]);
			setGstFiles([]);
			setCancelledFiles([]);
			setInterested(null);
			setNotinterested(null);
			setTradeName("");
			setCinNo("");
			setCoiFiles([]);
			setMsmeNumber("");
			setPanCard([]);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
			if (panFileInputRef.current) {
				panFileInputRef.current.value = "";
			}
		}
	};
	return (
		<div className="main-container" style={{ marginTop: 130 }}>
			<Navbar />
			<div className="form-container">
				<h2 className="form-title">Vendor Registration Form</h2>
				<form id="business-partner-form" onSubmit={handleSubmit} encType="multipart/form-data">
					<div className="form-row">
						<div className="input-group">
							<InputFeild
								label="Legal Entity Name"
								isRequired={true}
								id="legal-entity-name"
								name="legal-entity-name"
								placeholder="Cheque will be issued in this name"
								value={legalEntityName}
								onChange={handleInputChange(setLegalEntityName)}
							/>
							<InputFeild
								label="Trade Name"
								isRequired={true}
								id="tarde-name"
								name="trade-name"
								value={tradeName}
								onChange={handleInputChange(setTradeName)}
							/>
						</div>
						<div className="input-group">
							<InputFeild
								label="Contact Person Name"
								isRequired={true}
								id="contact-person-name"
								name="contact-person-name"
								value={contactPersonName}
								onChange={handleInputChange(setContactPersonName)}
							/>
							<InputFeild
								label="Designation"
								isRequired={true}
								id="designation"
								name="designation"
								value={designation}
								onChange={handleInputChange(setDesignation)}
							/>
						</div>
						<div className="input-group">
							<InputFeild
								label="Contact Number"
								isRequired={true}
								id="contact-number"
								name="contact-number"
								value={contactNumber}
								onChange={handleInputChange(setContactNumber)}
							/>
							<InputFeild
								label="Email ID"
								isRequired={true}
								id="email-id"
								name="email-id"
								type="email"
								value={emailId}
								onChange={handleInputChange(setEmailId)}
							/>
						</div>
						<div className="input-group">
							<InputFeild
								label="Address"
								isRequired={true}
								id="address"
								name="address"
								value={address}
								onChange={handleInputChange(setAddress)}
							/>
							<InputFeild
								label="State"
								isRequired={true}
								id="state"
								name="state"
								value={state}
								onChange={handleInputChange(setState)}
							/>
						</div>
						<div className="input-group">
							<InputFeild
								label="PAN Card Number"
								isRequired={true}
								id="pan-card-number"
								name="pan-card-number"
								value={panCardNumber}
								onChange={handleInputChange(setPanCardNumber)}
							/>
							<InputFeild
								label="Pin Code"
								isRequired={true}
								id="pin-code"
								name="pin-code"
								value={pinCode}
								onChange={handleInputChange(setPinCode)}
							/>
						</div>
						<div className="form-group">
							<div style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
								<label htmlFor="pan-card-upload" className="form-label">
									Upload PAN Card
								</label>
								<p
									style={{
										color: "red",
										margin: "0 0 0 5px",
										position: "relative",
										top: "-3px",
									}}
								>
									*
								</p>
							</div>
							<input
								type="file"
								id="pan-card-upload"
								name="pan-card-upload"
								className="form-file-input"
								ref={panFileInputRef}
								onChange={(e) => handleFileChange(e, "pan")}
							/>
						</div>
						{panCardUpload && (
							<div style={{ color: "green", marginBottom: "0px" }}>Uploading...</div>
						)}
						<TypeOfEntity
							typeOfEntity={typeOfEntity}
							setTypeOfEntity={setTypeOfEntity}
							cinNo={cinNo}
							setCinNo={setCinNo}
							handleFileChange={handleFileChange}
							uploadCoi={uploadCoi}
						/>
						<div className="form-group">
							<div className="form-question">
								<div className="form-question-label">
									Are you registered under Micro, Small & Medium Enterprise Development Act,
									2006?
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
										<label htmlFor="msme-yes" className="form-radio-label">
											Yes
										</label>
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
										<label htmlFor="msme-no" className="form-radio-label">
											No
										</label>
									</div>
								</div>
							</div>
						</div>
						{isMsme && (
							<div className="input-group">
								<div className="form-group">
									<div style={{ display: "flex", alignItems: "center" }}>
										<label htmlFor="udyam-certificate" className="form-label">
											MSME Registration Number
										</label>
										<p
											style={{
												color: "red",
												margin: "0 0 0 5px",
												position: "relative",
												top: "-3px",
											}}
										>
											*
										</p>
									</div>
									<input
										id="msme-number"
										type="text"
										value={msmeNumber || ""}
										onChange={(e) => setMsmeNumber(e.target.value)}
										className="form-input"
									/>
								</div>
								<div className="form-group">
									<div style={{ display: "flex", alignItems: "center" }}>
										<label htmlFor="udyam-certificate" className="form-label">
											Upload UDYAM Certificate
										</label>
										<p
											style={{
												color: "red",
												margin: "0 0 0 5px",
												position: "relative",
												top: "-3px",
											}}
										>
											*
										</p>
									</div>
									<input
										type="file"
										id="udyam-certificate"
										name="udyam-certificate"
										className="form-file-input"
										//ref={fileInputRef}
										onChange={(e) => {
											handleFileChange(e, "udyam");
										}}
									/>
									{uploading && (
										<div style={{ color: "green", marginBottom: "10px" }}>
											Uploading...
										</div>
									)}
								</div>
							</div>
						)}
						<div className="form-group">
							<div className="form-question">
								<div className="form-question-label">Are you registered under GST?</div>
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
										<label htmlFor="gst-yes" className="form-radio-label">
											Yes
										</label>
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
										<label htmlFor="gst-no" className="form-radio-label">
											No
										</label>
									</div>
								</div>
							</div>
						</div>
						{isGst && (
							<div className="input-group">
								<div className="form-group">
									<div style={{ display: "flex", alignItems: "center" }}>
										<label htmlFor="gst-number" className="form-label mt-4">
											GST Registration Number
										</label>
										<p
											style={{
												color: "red",
												margin: "0 0 0 5px",
												position: "relative",
												top: "-3px",
											}}
										>
											*
										</p>
									</div>
									<input
										type="text"
										id="gst-number"
										name="gst-number"
										className="form-input"
										value={gstNumber}
										onChange={handleInputChange(setGstNumber)}
									/>
								</div>
								<div className="form-group">
									<div style={{ display: "flex", alignItems: "center" }}>
										<label htmlFor="gst-certificate" className="form-label">
											Upload GST Certificate
										</label>
										<p
											style={{
												color: "red",
												margin: "0 0 0 5px",
												position: "relative",
												top: "-3px",
											}}
										>
											*
										</p>
									</div>
									<input
										type="file"
										id="gst-certificate"
										name="gst-certificate"
										className="form-file-input"
										//ref={fileInputRef}
										onChange={(e) => {
											handleFileChange(e, "gst");
										}}
									/>
									{gstuploading && <div style={{ color: "green" }}>Uploading...</div>}
								</div>
							</div>
						)}
						<div className="input-group">
							<InputFeild
								label="Bank Name"
								isRequired={true}
								id="bank-name"
								name="bank-name"
								value={bankName}
								onChange={handleInputChange(setBankName)}
								placeholder="Enter Bank Name"
							/>
							<InputFeild
								label="Beneficiary Name"
								isRequired={true}
								id="beneficiary-name"
								name="beneficiary-name"
								value={beneficiaryName}
								onChange={handleInputChange(setBeneficiaryName)}
								placeholder="Enter Beneficiary Name"
							/>
						</div>
						<div className="input-group">
							<InputFeild
								label="Account Number"
								isRequired={true}
								id="account-number"
								name="account-number"
								value={accountNumber}
								onChange={handleInputChange(setAccountNumber)}
								placeholder="Enter Account Number"
							/>
							<InputFeild
								label="IFSC Code"
								isRequired={true}
								id="ifsc-code"
								name="ifsc-code"
								value={ifscCode}
								onChange={handleInputChange(setIfscCode)}
								placeholder="Enter IFSC Code"
							/>
						</div>
						<div className="form-group">
							<div style={{ display: "flex", alignItems: "center" }}>
								<label htmlFor="cancelled-cheque" className="form-label">
									Cancelled Cheque
								</label>
								<p
									style={{
										color: "red",
										margin: "0 0 0 5px",
										position: "relative",
										top: "-3px",
									}}
								>
									*
								</p>
							</div>
							<input
								type="file"
								id="cancelled-cheque"
								name="cancelled-cheque"
								className="form-file-input"
								ref={fileInputRef}
								onChange={(e) => {
									handleFileChange(e, "cheque");
								}}
							/>
							{chequeuploading && <div style={{ color: "green" }}>Uploading...</div>}
						</div>
						<div className="form-group">
							<button type="submit" className="form-submit-button" disabled={isSubmitting}>
								{isSubmitting ? "Submitting..." : "Submit"}
							</button>
						</div>
						{submissionStatus === "success" && (
							<div style={{ color: "green", fontSize: "18" }}>
								Vendor Registration Details Successfully Submitted!
								<br></br>
								<br></br>
								Thank you for providing your vendor registration details. Your information has
								been successfully captured and recorded in our system. We will review the
								submitted details and get back to you if any additional information is needed.
								Please keep an eye on your email for further communication from our team. If
								you have any immediate questions or concerns, feel free to contact our support
								team.
							</div>
						)}
						{submissionStatus === "error" && (
							<div style={{ color: "red" }}>Error submitting form. Please try again.</div>
						)}
					</div>
				</form>
			</div>
		</div>
	);
};

export default VendorRegistrationForm;
