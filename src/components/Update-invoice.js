import React, { useRef, useState } from "react";
import "../App.css";
import axios from "axios";
import Navbar from "./Navbar";

const UpdateInvoice = () => {
	const [vendorPanNumber, setVendorPanNumber] = useState("");
	const [vendorName, setVendorName] = useState("");
	const [invoiceDate, setInvoiceDate] = useState("");
	const [invoiceValue, setInvoiceValue] = useState("");
	const [purchaseOrderNumber, setPurchaseOrderNumber] = useState("");
	const [ondcContactPoc, setOndcContactPoc] = useState("");
	const [submissionStatus, setSubmissionStatus] = useState(null);
	const fileInputRef = useRef(null);
	const [vendorNames, setVendorNames] = useState("");
	const [pocName, setPocName] = useState([]);
	const [loading, setLoading] = useState(false);
	const [files, setFiles] = useState([]);
	const [recordId, setRecordID] = useState("");
	const [loaderSubmit, setLoaderSubmit] = useState(false);
	const [loaderforName, setLoaderforName] = useState(false);
	const [ondcContactEmail, setOndcContactEmail] = useState("");
	const [pocEmailStatus, setPocEmailStatus] = useState("");
	const [loaderforPoc, setLoaderforPoc] = useState(false);
	const handleChange = (e) => {
		const { name, value } = e.target;
		switch (name) {
			case "vendorPanNumber":
				setVendorPanNumber(value);

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
				setOndcContactPoc(value);
				break;
			case "ondcContactEmail":
				setOndcContactEmail(value);
				break;
			default:
				break;
		}
	};
	const handlefilter = async (e) => {
		const { value } = e.target;
		const cleanedValue = value.replace(/\s/g, "");
		try {
			setLoaderforName(true);
			const encodedValue = encodeURIComponent(cleanedValue);
			const response = await axios.get(`/api/vendor/vendor-info?cleanedValue=${encodedValue}`);
			setRecordID(response.data.data[0].record_id);
			setVendorNames(response.data.data[0]["Legal Entity Name"]);
		} catch (err) {
			console.log(err);
		} finally {
			setLoaderforName(false);
		}
	};

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
				console.error("Error converting file to Base64:", error);
			}
		}
	};

	const uploadBase64ToBackend = async (base64Data, mimeType) => {
		try {
			setLoading(true);
			const response = await axios.post(
				`/api/vendor/file-upload`,
				{ base64Data, mimeType },
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
			const {
				msg: { files },
			} = response.data;
			setFiles(files);
		} catch (error) {
			console.error("Error uploading base64 file:", error);
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
			const response = await axios.get(`/api/vendor/poc-name?verifyValue=${verifiedValue}`);
			if (response.data.data.length > 0) {
				const poc = response.data.data[0];
				setPocName([{ id: poc.record_id, value: poc.Name }]); // Adjust column ID for POC name
				setPocEmailStatus("");
			} else {
				setPocName([]);
				setPocEmailStatus("Please verify POC email ID");
			}
		} catch (err) {
			console.log(err);
			setPocName([]);
			setPocEmailStatus("Error verifying POC email ID");
		} finally {
			setLoaderforPoc(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (
			!vendorPanNumber ||
			!vendorName ||
			!invoiceDate ||
			!invoiceValue ||
			!purchaseOrderNumber ||
			!ondcContactPoc
		) {
			alert("Please fill in all required fields.");
			return;
		} else if (files.length === 0) {
			alert("please upload the invoice copy");
		} else {
			setLoaderSubmit(true);
			let ondcContactPOCInfo = { id: "", value: "" };
			try {
				if (ondcContactPoc) {
					ondcContactPOCInfo = JSON.parse(ondcContactPoc);
				}
			} catch (error) {
				console.error("Error parsing ONDC Contact POC:", error);
				setSubmissionStatus("error");
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
				record_id: recordId,
			};
			try {
				await axios.post(`/api/vendor/upload-invoice`, payload, {
					headers: {
						"Content-Type": "application/json",
					},
				});
				//console.log('Server response:', response.data);
				setSubmissionStatus("success");
			} catch (error) {
				console.error("Error submitting form:", error);
				setSubmissionStatus("error");
				setTimeout(() => {
					setSubmissionStatus(null);
				}, 3000);
			} finally {
				setLoaderSubmit(false);
				handleReset();
			}
		}
	};

	const handleReset = () => {
		setVendorPanNumber("");
		setVendorName("");
		setInvoiceDate("");
		setInvoiceValue("");
		setPurchaseOrderNumber("");
		setOndcContactPoc("");
		setOndcContactEmail("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<div className="main-container">
			<Navbar />
			<div className="main-content">
				<div className="form-container">
					<h2 className="form-title">Vendor Invoice Upload</h2>
					<form onSubmit={handleSubmit} onReset={handleReset} encType="multipart/form-data">
						<div className="grid-container">
							<div className="form-group">
								<div style={{ display: "flex", alignItems: "center" }}>
									<label htmlFor="vendorPanNumber">Vendor Pan Number</label>
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
									id="vendorPanNumber"
									name="vendorPanNumber"
									value={vendorPanNumber}
									onChange={(e) => {
										handleChange(e);
									}}
									onBlur={(e) => {
										handlefilter(e);
									}}
								/>
							</div>
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
									onChange={handleChange}
								>
									<option value="" disabled>
										Select Vendor
									</option>
									{loaderforName ? (
										<option disabled>Getting vendor name...</option>
									) : vendorNames ? (
										<option value={vendorNames}>{vendorNames}</option>
									) : (
										<option value="" disabled>
											No vender names available
										</option>
									)}
								</select>
							</div>
							<div className="form-group">
								<div style={{ display: "flex", alignItems: "center" }}>
									<label htmlFor="invoiceDate">Invoice Date</label>
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
									type="date"
									id="invoiceDate"
									name="invoiceDate"
									value={invoiceDate}
									onChange={handleChange}
								/>
							</div>
							<div className="form-group">
								<div style={{ display: "flex", alignItems: "center" }}>
									<label htmlFor="invoiceValue">Invoice Value</label>
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
									type="number"
									id="invoiceValue"
									name="invoiceValue"
									value={invoiceValue}
									onChange={handleChange}
								/>
							</div>
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
									onChange={(e) => {
										handleFileChange(e);
									}}
								/>
								{loading && <div style={{ color: "green" }}>Uploading...</div>}
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
									onBlur={(e) => {
										handlePocEmailChange(e);
									}}
								/>
								{pocEmailStatus && (
									<div style={{ color: "red", marginTop: "5px" }}>{pocEmailStatus}</div>
								)}
							</div>
							<div className="form-group half-width">
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
									value={ondcContactPoc}
									onChange={handleChange}
								>
									<option value="" disabled>
										Select Contact POC
									</option>
									{loaderforPoc ? (
										<option disabled>Getting POC name...</option>
									) : pocName?.length > 0 ? (
										pocName?.map((poc, index) => (
											<option key={index} value={JSON.stringify(poc)}>
												{poc.value}
											</option>
										))
									) : (
										<option value="" disabled>
											No POC avaliable
										</option>
									)}
								</select>
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

export default UpdateInvoice;
