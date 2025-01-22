import React, { useState, useRef } from "react";
import "../App.css";
import Navbar from "./Navbar";
import {
	fetchInvoiceDataUtil,
	fetchNumbers,
	fetchPocData,
	fetchVendorNames,
	isInvoiceExists,
	submitInvoice,
	uploadBase64ToBackend,
} from "../utilities/utils";
import { convertFileToBase64 } from "../utilities/fileUtils";
import InputField from "./InputFeild";
const baseUrl = process.env.REACT_APP_BASE_URL;

const VendorInvoiceUpload = () => {
	const [activeTab, setActiveTab] = useState("new-upload");
	const [uploadType, setUploadType] = useState("new-upload");
	const [vendorPanNumber, setVendorPanNumber] = useState("");
	const [vendorName, setVendorName] = useState("");
	const [vendorMap, setVendorMap] = useState([]);
	const [invoiceDate, setInvoiceDate] = useState("");
	const [invoiceValue, setInvoiceValue] = useState("");
	const [purchaseOrderNumber, setPurchaseOrderNumber] = useState("");
	const [submissionStatus, setSubmissionStatus] = useState(null);
	const fileInputRef = useRef(null);
	const serviceFileInputRef = useRef(null);
	const [pocName, setPocName] = useState("");
	const [loading, setLoading] = useState(false);
	const [files, setFiles] = useState([]);
	const [recordId, setRecordID] = useState("");
	const [loaderSubmit, setLoaderSubmit] = useState(false);
	const [loaderforName, setLoaderforName] = useState(false);
	const [ondcContactEmail, setOndcContactEmail] = useState("");
	const [pocEmailStatus, setPocEmailStatus] = useState("");
	const [loaderforPoc, setLoaderforPoc] = useState(false);
	const [fetching, setFetching] = useState(false);
	const [invoiceNumber, setInvoiceNumber] = useState("");
	const [filePath, setFilePath] = useState("");
	const [updateRecordId, setUpdateRecordId] = useState("");
	const [pocRecordId, setPocRecordId] = useState("");
	const [pocMap, setPocMap] = useState([]);
	const [verifyInvoice, setVerifyInvoice] = useState("");
	const [verifyPan, setVerifyPan] = useState("");
	const [verifyName, setVerifyName] = useState("");
	const [serviceAcceptanceFile, setServiceAcceptanceFile] = useState([]);
	const [loaderForService, setLoaderForService] = useState(false);
	const [serviceFilePath, setServiceFilePath] = useState("");
	const [workflowStatus, setWorkflowStatus] = useState("");
	const [poMap, setPoMap] = useState([]);
	const [poLoader, setPoLoader] = useState(false);
	const handleChange = (e) => {
		const { name, value } = e.target;
		switch (name) {
			case "vendorPanNumber":
				setVendorPanNumber(value);
				setVendorName("");
				break;
			case "vendorName":
				setVendorName(value);
				break;
			case "invoiceDate":
				setInvoiceDate(value);
				break;
			case "invoiceValue":
				setInvoiceValue(value);
				break;
			case "purchaseOrderNumber":
				setPurchaseOrderNumber(value);
				break;
			case "ondcContactPoc":
				pocName(value);
				break;
			case "ondcContactEmail":
				setOndcContactEmail(value);
				setPocName("");
				break;
			case "invoiceNumber":
				setInvoiceNumber(value);
				break;
			default:
				break;
		}
	};
	const handleFilter = async (e) => {
		const { value } = e.target;
		if (value) {
			const cleanedValue = value.replace(/\s/g, "");
			setLoaderforName(true);
			try {
				const vendorData = await fetchVendorNames(cleanedValue);
				setVendorMap(vendorData);
			} finally {
				setLoaderforName(false);
			}
		}
	};

	const handleFileChange = async (e, fileType) => {
		const file = e.target.files[0];
		if (file) {
			try {
				const base64File = await convertFileToBase64(file);
				if (fileType === "invoice") {
					setLoading(true);
				} else if (fileType === "service") {
					setLoaderForService(true);
				}
				const {
					msg: { files },
				} = await uploadBase64ToBackend(base64File, file.type);
				if (fileType === "invoice") {
					setFiles(files);
					setFilePath("");
				} else if (fileType === "service") {
					setServiceAcceptanceFile(files);
					setServiceFilePath("");
				}
			} catch (error) {
				console.error("Error processing file upload:", error);
			} finally {
				setLoading(false);
				setLoaderForService(false);
			}
		}
	};
	const handlePocEmailChange = async (e) => {
		const { value } = e.target;
		setOndcContactEmail(value);
		try {
			setLoaderforPoc(true);
			const pocData = await fetchPocData(value);
			if (pocData.length > 0) {
				setPocMap(pocData);
				setPocEmailStatus("");
			} else {
				setPocMap([]);
				setPocEmailStatus("Please verify POC email ID");
			}
		} catch (err) {
			setPocMap([]);
			setPocEmailStatus("Error verifying POC email ID");
		} finally {
			setLoaderforPoc(false);
		}
	};
	const fetchInvoiceData = async () => {
		try {
			setFetching(true);
			if (!invoiceNumber.trim()) {
				alert("Please enter the invoice number");
				return;
			}
			const { invoiceData, pocDetails } = await fetchInvoiceDataUtil(baseUrl, invoiceNumber);
			setUpdateRecordId(invoiceData.recordId);
			setVerifyPan(invoiceData.vendorPAN);
			setVerifyName(invoiceData.vendorName);
			setInvoiceDate(invoiceData.invoiceDate);
			setPurchaseOrderNumber(invoiceData.poNumber);
			setInvoiceValue(invoiceData.invoiceValue);
			setVerifyInvoice(invoiceData.invoiceNumber);
			setFiles(invoiceData.attachments);
			setFilePath(invoiceData.filePath);
			setServiceAcceptanceFile(invoiceData.serviceAttachments);
			setServiceFilePath(invoiceData.serviceFilePath);
			setWorkflowStatus(invoiceData["workflowStatus"]);
			if (pocDetails) {
				setOndcContactEmail(pocDetails.email);
				setPocMap(pocDetails.data);
				setPocName(pocDetails.data[0]?.name || "");
				setPocRecordId(pocDetails.data[0]?.id || "");
				setPocEmailStatus("");
			} else {
				setPocName("");
				setPocEmailStatus("No POC found.");
			}
		} catch (error) {
			alert(error.message);
		} finally {
			setFetching(false);
		}
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (uploadType === "re-upload" && verifyInvoice !== invoiceNumber) {
			alert("Please check the Invoice Number");
			return;
		}
		if (uploadType === "re-upload" && verifyPan !== vendorPanNumber && verifyName !== vendorName) {
			alert("Please verify the Vendor Pan and Name");
			return;
		}
		if (uploadType === "re-upload") {
			if (workflowStatus !== "New" && workflowStatus !== "Dept Approval Pending") {
				alert(
					"Your invoice has been approved and cannot be reuploaded at this time. For further assistance, please reach out to your ONDC point of contact."
				);
				return;
			}
		}
		if (uploadType === "new-upload" && invoiceNumber.trim()) {
			try {
				const exists = await isInvoiceExists(baseUrl, invoiceNumber);
				if (exists) {
					alert(
						"This invoice number already exists. You can update it by selecting the Re-upload option."
					);
					return;
				}
			} catch (error) {
				alert("An error occurred while checking the invoice number. Please try again.");
				return;
			}
		}
		if (
			!vendorPanNumber ||
			!vendorName ||
			!invoiceDate ||
			!invoiceValue ||
			!purchaseOrderNumber ||
			!pocName ||
			!invoiceNumber
		) {
			alert("Please fill in all required fields.");
			return;
		}
		if (files.length === 0 || serviceAcceptanceFile.length === 0) {
			if (files.length === 0) {
				alert("Please upload the Invoice copy");
				return;
			}
			if (serviceAcceptanceFile.length === 0) {
				alert("Please upload the Service Acceptance File");
				return;
			}
		}
		setLoaderSubmit(true);
		const payload = {
			...(uploadType !== "re-upload" && {
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
			record_id: recordId,
			serviceAcceptanceFile,
			...(uploadType === "re-upload" ? { updateRecordId: updateRecordId } : {}),
		};
		try {
			const response = await submitInvoice(baseUrl, uploadType, payload);
			setSubmissionStatus("success");
			setTimeout(() => {
				setSubmissionStatus(null);
			}, 3000);
		} catch (error) {
			setSubmissionStatus("error");
			setTimeout(() => {
				setSubmissionStatus(null);
			}, 3000);
		} finally {
			setLoaderSubmit(false);
			handleReset();
		}
	};
	const handleVendorNameChange = async (e) => {
		const selectedVendorId = e.target.value;
		const selectedVendor = vendorMap.find((vendor) => vendor.id === selectedVendorId);
		setVendorName(selectedVendor ? selectedVendor.name : "");
		setRecordID(selectedVendorId);
	};
	const fetchPoNumbers = async () => {
		try {
			setPoLoader(true);
			const poNumbers = await fetchNumbers(vendorName);
			setPoMap(poNumbers);
		} catch (e) {
			console.error("Error fetching PO numbers:", e);
		} finally {
			setPoLoader(false);
		}
	};
	const handlePocNameChange = (event) => {
		const selectedPocName = event.target.value;
		const selectedPoc = pocMap.find((poc) => poc.id === selectedPocName);
		if (selectedPoc) {
			setPocName(selectedPoc.name);
			setPocRecordId(selectedPoc.id);
		} else {
			setPocName("");
			setPocRecordId("");
		}
	};
	const handleTabChange = (tab) => {
		setUploadType(tab);
		setActiveTab(tab);
		handleReset();
	};
	const handleReset = () => {
		setVendorPanNumber("");
		setVendorName("");
		setInvoiceDate("");
		setInvoiceValue("");
		setPurchaseOrderNumber("");
		setOndcContactEmail("");
		setInvoiceNumber("");
		setFilePath("");
		setVendorMap([]);
		setPocMap([]);
		setPocName("");
		setPocRecordId("");
		setServiceFilePath("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
		if (serviceFileInputRef.current) {
			serviceFileInputRef.current.value = "";
		}
		setFiles([]);
		setServiceAcceptanceFile([]);
	};

	return (
		<div className="main-container" style={{ marginTop: 75 }}>
			<Navbar />
			<div className="tab-container" style={{ marginBottom: 10 }}>
				<button
					className={`tab ${activeTab === "new-upload" ? "active" : ""}`}
					onClick={() => handleTabChange("new-upload")}
				>
					Invoice Upload
				</button>
				<button
					className={`tab ${activeTab === "re-upload" ? "active" : ""}`}
					onClick={() => handleTabChange("re-upload")}
				>
					Invoice Re-upload
				</button>
			</div>
			<div className="main-content">
				<div className="form-container">
					<div className="form-header">
						<h2 className="form-title">Vendor Invoice Upload</h2>
					</div>
					<form onSubmit={handleSubmit} onReset={handleReset} encType="multipart/form-data">
						<div className="grid-container">
							<InputField
								label="Vendor Pan Number"
								isRequired={true}
								id="vendorPanNumber"
								name="vendorPanNumber"
								placeholder="Enter Vendor PAN Number"
								value={vendorPanNumber}
								onChange={(e) => handleChange(e)}
								onBlur={(e) => handleFilter(e)} // onBlur is included here
							/>
							<div className="form-group half-width">
								<div style={{ display: "flex", alignItems: "center" }}>
									<label htmlFor="vendorName">Vendor Name</label>
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
								<select
									id="vendorName"
									name="vendorName"
									value={vendorName}
									className="form-input"
									onChange={handleVendorNameChange}
								>
									<option value="" disabled>
										{loaderforName ? "Getting vendor names..." : "Select Vendor"}
									</option>
									{!loaderforName &&
										vendorMap?.map((vendor) => (
											<option key={vendor.id} value={vendor.id}>
												{vendor.name}
											</option>
										))}
									{!loaderforName && vendorMap?.length === 0 && (
										<option value="" disabled>
											No vendor names available
										</option>
									)}
								</select>
							</div>
							<InputField
								label="Invoice Number"
								isRequired={true}
								id="invoiceNumber"
								name="invoiceNumber"
								type="number"
								value={invoiceNumber}
								onChange={handleChange}
								additionalContent={
									!fetching && uploadType === "re-upload" ? (
										<button type="button" onClick={fetchInvoiceData}>
											Get the Details
										</button>
									) : fetching ? (
										<p>Fetching the Details...</p>
									) : null
								}
							/>
							<InputField
								label="Invoice Date"
								isRequired={true}
								id="invoiceDate"
								name="invoiceDate"
								type="date"
								value={invoiceDate}
								onChange={handleChange}
							/>
							<InputField
								label="Invoice Value"
								isRequired={true}
								id="invoiceValue"
								name="invoiceValue"
								type="number"
								value={invoiceValue}
								onChange={handleChange}
							/>
							<div className="form-group">
								<div style={{ display: "flex", alignItems: "center" }}>
									<label htmlFor="invoiceCopy">Upload Invoice Copy</label>
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
									id="invoiceCopy"
									name="invoiceCopy"
									ref={fileInputRef}
									className="form-input"
									onChange={(e) => {
										handleFileChange(e, "invoice");
									}}
								/>
								{loading && <div style={{ color: "green" }}>Uploading...</div>}
								{filePath && (
									<div style={{ marginTop: 10, color: "green" }}>
										<p style={{ marginBottom: "5px" }}>
											<strong>Current file:</strong>
										</p>
										<p style={{ wordWrap: "break-word" }}>{filePath}</p>
									</div>
								)}
							</div>
							<div className="form-group">
								<div style={{ display: "flex", alignItems: "center" }}>
									<label htmlFor="purchaseOrderNumber">Purchase Order Number</label>
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
								<select
									id="poNumber"
									name="poNumber"
									value={purchaseOrderNumber}
									onClick={fetchPoNumbers}
									className="form-input"
									onChange={(e) => setPurchaseOrderNumber(e.target.value)}
								>
									<option value="" disabled>
										{poLoader ? "Loading POs..." : "Select PO Number"}
									</option>
									{purchaseOrderNumber &&
										!poMap.some((po) => po.number === purchaseOrderNumber) && (
											<option value={purchaseOrderNumber}>{purchaseOrderNumber}</option>
										)}
									{poMap?.length > 0
										? poMap.map((po, index) => (
												<option key={index} value={po.number}>
													{po.number}
												</option>
										  ))
										: !poLoader && (
												<option value="" disabled>
													No POs available/select the vendor name
												</option>
										  )}
								</select>
							</div>
							<InputField
								label="ONDC Contact Email"
								isRequired={true}
								id="ondcContactEmail"
								name="ondcContactEmail"
								type="email"
								value={ondcContactEmail}
								onChange={handleChange}
								onBlur={(e) => {
									handlePocEmailChange(e);
								}}
								additionalContent={
									pocEmailStatus && <div style={{ color: "red" }}>{pocEmailStatus}</div>
								}
							/>
							<div className="form-group">
								<div style={{ display: "flex", alignItems: "center" }}>
									<label htmlFor="ondcContactPoc">ONDC Contact POC</label>
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
								<select
									id="ondcContactPoc"
									name="ondcContactPoc"
									value={pocName}
									className="form-input"
									onChange={handlePocNameChange}
								>
									<option value="" disabled>
										{loaderforPoc ? "Getting POC names..." : "Select Contact POC"}
									</option>
									{!loaderforPoc &&
										pocMap?.length > 0 &&
										pocMap?.map((poc) => (
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
							<div className="form-group">
								<div style={{ display: "flex", alignItems: "center" }}>
									<label htmlFor="serviceAcceptanceFile">Service Acceptance File</label>
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
									id="serviceAcceptanceFile"
									name="serviceAcceptanceFile"
									ref={serviceFileInputRef}
									className="form-input"
									onChange={(e) => {
										handleFileChange(e, "service");
									}}
								/>
								{loaderForService && <div style={{ color: "green" }}>Uploading...</div>}
								{serviceFilePath && (
									<div style={{ marginTop: 10, color: "green" }}>
										<p style={{ marginBottom: "5px" }}>
											<strong>Current file:</strong>
										</p>
										<p style={{ wordWrap: "break-word" }}>{serviceFilePath}</p>
									</div>
								)}
							</div>
						</div>

						<div className="form-actions">
							<button
								type="submit"
								className={loaderSubmit ? "submit-button-loading" : "submit-button"}
								disabled={loaderSubmit}
							>
								{loaderSubmit ? "Submitting....." : "Submit"}
							</button>
							<button type="reset" className="clear-button">
								Clear
							</button>
						</div>
						{submissionStatus === "success" && (
							<div style={{ color: "green", fontSize: "18" }}>
								Thank you for uploading your invoice to the system.
								<br></br>
								<br></br>
								Your invoice is currently being processed and will go through various stages
								of approval. We will notify you of its status at each stage.
								<br></br>
								Thank you for your patience.
							</div>
						)}
						{submissionStatus === "error" && (
							<div style={{ color: "red" }}>Error submitting form. Please try again.</div>
						)}
					</form>
				</div>
			</div>
		</div>
	);
};

export default VendorInvoiceUpload;
