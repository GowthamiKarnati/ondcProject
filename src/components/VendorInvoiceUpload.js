import React, { useState, useRef, useEffect } from "react";
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
import InvoiceTabs from "./InvoiceTabs";
import CheckInvoiceStatus from "./CheckInvoiceStatus";
import PurchaseOrderCheckboxes from "./PONumberCom";

const VendorInvoiceUpload = () => {
	const fileInputRef = useRef(null);
	const serviceFileInputRef = useRef(null);
	const [activeTab, setActiveTab] = useState("new-upload");
	const [vendorPanNumber, setVendorPanNumber] = useState("");
	const [vendorName, setVendorName] = useState("");
	const [vendorMap, setVendorMap] = useState([]);
	const [invoiceDate, setInvoiceDate] = useState("");
	const [invoiceValue, setInvoiceValue] = useState("");
	const [purchaseOrderNumber, setPurchaseOrderNumber] = useState([]);
	const [submissionStatus, setSubmissionStatus] = useState(null);
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
	const [selectedPoNumbers, setSelectedPoNumbers] = useState([]);
	const [selectedPOId, setselectedPOId] = useState([]);
	console.log("selectedPoNumbers", selectedPoNumbers);
	useEffect(() => {
		if (submissionStatus === "success") {
			const action = activeTab === "re-upload" ? "updating" : "uploading";
			alert(
				`Thank you for ${action} your invoice to the system.\n\n` +
					"Your invoice is currently being processed and will go through various " +
					"stages of approval. We will notify you of its status at each stage.\n\n" +
					"Thank you for your patience."
			);
		} else if (submissionStatus === "error") {
			alert("Error submitting form. Please try again.");
		}
	}, [submissionStatus]);
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
			case "ondcContactPoc":
				pocName(value);
				break;
			case "ondcContactEmail":
				setOndcContactEmail(value);
				setPocName("");
				setPocEmailStatus("");
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
			} catch (err) {
				console.error("Error fetching vendor names:", err.message);
			} finally {
				setLoaderforName(false);
			}
		}
	};

	const handleFileChange = async (e, fileType) => {
		const file = e.target.files[0];
		if (file?.type === "image/svg+xml") {
			alert("SVG files are not allowed. Please upload a PNG, JPEG, or PDF.");
			return;
		}
		if (fileType === "invoice" && activeTab === "new-upload") {
			setFiles([]);
		} else if (fileType === "service" && activeTab === "new-upload") {
			setServiceAcceptanceFile([]);
		}
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
			const { invoiceData, pocDetails } = await fetchInvoiceDataUtil(invoiceNumber, vendorName);
			setUpdateRecordId(invoiceData.recordId);
			setVerifyPan(invoiceData.vendorPAN);
			setVerifyName(invoiceData.vendorName);
			setInvoiceDate(invoiceData.invoiceDate);
			setInvoiceValue(invoiceData.invoiceValue);
			setVerifyInvoice(invoiceData.invoiceNumber);
			setFiles(invoiceData.attachments);
			setFilePath(invoiceData.filePath);
			setServiceAcceptanceFile(invoiceData.serviceAttachments);
			setServiceFilePath(invoiceData.serviceFilePath);
			setWorkflowStatus(invoiceData["workflowStatus"]);
			setPurchaseOrderNumber(
				invoiceData.poNumbers.map((po) => ({
					id: po.record_id,
					number: po["PO num"],
				}))
			);
			setselectedPOId(invoiceData.poNumbers.map((po) => po.record_id));
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
			return;
		} finally {
			setFetching(false);
		}
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (activeTab === "re-upload" && verifyInvoice !== invoiceNumber) {
			alert("Please check the Invoice Number");
			return;
		}
		if (activeTab === "re-upload" && verifyPan !== vendorPanNumber && verifyName !== vendorName) {
			alert("Please verify the Vendor Pan and Name");
			return;
		}
		if (
			!vendorPanNumber ||
			!vendorName ||
			!invoiceDate ||
			!invoiceValue ||
			//!purchaseOrderNumber ||
			!pocName ||
			!invoiceNumber
		) {
			alert("Please fill in all required fields.");
			return;
		}
		if (activeTab === "re-upload") {
			if (workflowStatus !== "New" && workflowStatus !== "Dept Approval Pending") {
				alert(
					"Your invoice has been approved and cannot be reuploaded at this time. For further assistance, please reach out to your ONDC point of contact."
				);
				return;
			}
		}
		if (activeTab === "new-upload" && invoiceNumber.trim()) {
			try {
				const exists = await isInvoiceExists(invoiceNumber, vendorName);
				if (exists) {
					alert(
						"This invoice number already exists. You can update it by selecting the Invoice Re-upload option."
					);
					return;
				}
			} catch (error) {
				alert("An error occurred while checking the invoice number. Please try again.");
				return;
			}
		}
		if (!selectedPoNumbers || selectedPoNumbers?.length === 0) {
			alert("Please select at least one Purchase Order Number.");
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
			...(activeTab !== "re-upload" && {
				vendorPanNumber: vendorPanNumber.toUpperCase(),
				vendorName,
			}),
			invoiceDate,
			invoiceValue,
			...(activeTab === "re-upload" ? { selectedPOId: selectedPOId } : {}),
			invoiceNumber,
			ondcContactPocId: pocRecordId,
			ondcContactPocName: pocName,
			files,
			record_id: recordId,
			serviceAcceptanceFile,
			selectedPoNumbers: selectedPoNumbers,
			...(activeTab === "re-upload" ? { updateRecordId: updateRecordId } : {}),
		};
		try {
			const response = await submitInvoice(activeTab, payload);
			setLoaderSubmit(false);
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
		setActiveTab(tab);
		handleReset();
	};
	const handleReset = () => {
		setVendorPanNumber("");
		setVendorName("");
		setInvoiceDate("");
		setInvoiceValue("");
		setPurchaseOrderNumber([]);
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
		setUpdateRecordId("");
		setWorkflowStatus("");
		setVerifyName("");
		setVerifyPan("");
		setVerifyInvoice("");
		setInvoiceNumber("");
		setPocEmailStatus("");
		setSelectedPoNumbers("");
		setPoMap("");
		setselectedPOId([]);
	};

	return (
		<>
			<Navbar />
			<InvoiceTabs activeTab={activeTab} handleTabChange={handleTabChange} />
			<div className="main-container" style={{ marginTop: 140 }}>
				<div className="main-content">
					<div className="form-container">
						<div className="form-header">
							<h2 className="form-title">
								{activeTab === "re-upload"
									? "Vendor Invoice Re-Upload"
									: activeTab === "check-status"
									? "Check Invoice Status"
									: "Vendor Invoice Upload"}
							</h2>
						</div>
						{activeTab === "check-status" ? (
							<CheckInvoiceStatus />
						) : (
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
										onBlur={(e) => handleFilter(e)}
									/>
									<div className="form-group half-width">
										<div style={{ display: "flex", alignItems: "center" }}>
											<label htmlFor="vendorName">Company Name</label>
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
											onBlur={fetchPoNumbers}
										>
											<option value="" disabled>
												{loaderforName
													? "Getting company names..."
													: "Select Company"}
											</option>
											{!loaderforName &&
												vendorMap?.map((vendor) => (
													<option key={vendor.id} value={vendor.id}>
														{vendor.name}
													</option>
												))}
											{!loaderforName && vendorMap?.length === 0 && (
												<option value="" disabled>
													No company names available
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
											!fetching && activeTab === "re-upload" ? (
												<button type="button" onClick={fetchInvoiceData}>
													Get the Details
												</button>
											) : fetching ? (
												<p style={{ color: "green" }}>Fetching the Details...</p>
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
											accept=".jpg,.jpeg,.png,.pdf"
											onChange={(e) => {
												handleFileChange(e, "invoice");
											}}
										/>
										{loading && <div style={{ color: "green" }}>Uploading...</div>}
										{filePath && (
											<a
												href={filePath}
												target="_blank"
												rel="noopener noreferrer"
												style={{
													marginBottom: "5px",
													fontSize: "15px",
													color: "#3944BC",
													cursor: "pointer",
													textDecoration: "none",
												}}
											>
												📎 1 File Attached
											</a>
										)}
									</div>
									<PurchaseOrderCheckboxes
										poMap={poMap}
										setSelectedPoNumbers={setSelectedPoNumbers}
										poLoader={poLoader}
										purchaseOrderNumber={purchaseOrderNumber}
										selectedPoNumbers={selectedPoNumbers}
									/>
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
											pocEmailStatus && (
												<div style={{ color: "red" }}>{pocEmailStatus}</div>
											)
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
											<label htmlFor="serviceAcceptanceFile">
												Service Acceptance File
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
											id="serviceAcceptanceFile"
											name="serviceAcceptanceFile"
											ref={serviceFileInputRef}
											className="form-input"
											accept=".jpg,.jpeg,.png,.pdf"
											onChange={(e) => {
												handleFileChange(e, "service");
											}}
										/>
										{loaderForService && (
											<div style={{ color: "green" }}>Uploading...</div>
										)}
										{/* {serviceFilePath && (
											<p
												style={{
													marginBottom: "5px",
													fontSize: "15px",
													color: "#3944BC",
												}}
											>
												1 File Attached
											</p>
										)} */}
										{serviceFilePath && (
											<a
												href={serviceFilePath}
												target="_blank"
												rel="noopener noreferrer"
												style={{
													marginBottom: "5px",
													fontSize: "15px",
													color: "#3944BC",
													cursor: "pointer",
													textDecoration: "none",
												}}
											>
												📎 1 File Attached
											</a>
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
							</form>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default VendorInvoiceUpload;
