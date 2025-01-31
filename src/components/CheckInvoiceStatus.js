import React, { useState } from "react";
import { fetchInvoiceDataUtil, fetchVendorNames } from "../utilities/utils";
import InputField from "./InputFeild";

function CheckInvoiceStatus() {
	const [panNumber, setPanNumber] = useState("");
	const [companyName, setCompanyName] = useState("");
	const [invoiceNumber, setInvoiceNumber] = useState("");
	const [workflowStatus, setWorkflowStatus] = useState("");
	const [loading, setLoading] = useState(false);
	const [number, setNumber] = useState("");

	const handlePanChange = (e) => {
		setPanNumber(e.target.value);
	};

	const handleInvoiceChange = (e) => {
		setInvoiceNumber(e.target.value);
	};
	const fetchCompanyData = async () => {
		if (!panNumber) {
			alert("Please enter a PAN number");
			return;
		}
		setLoading(true);
		try {
			const cleanedValue = panNumber.replace(/\s/g, "");
			const response = await fetchVendorNames(cleanedValue);
			console.log("response", response);
			if (response.length === 0) {
				alert("No company found for the given PAN number.");
				setCompanyName("");
				return;
			}
			setCompanyName(response[0].name);
		} catch (err) {
			alert(`${err}`);
		} finally {
			setLoading(false);
		}
	};
	const fetchInvoiceStatus = async () => {
		if (!invoiceNumber) {
			alert("Please enter an invoice number");
			return;
		}
		setLoading(true);
		try {
			const { invoiceData } = await fetchInvoiceDataUtil(invoiceNumber, companyName);
			setWorkflowStatus(invoiceData["workflowStatus"]);
			setNumber(invoiceData["invoiceNumber"]);
		} catch (err) {
			alert(err.message);
			return;
		} finally {
			setLoading(false);
			setInvoiceNumber("");
		}
	};
	const resetForm = () => {
		setPanNumber("");
		setCompanyName("");
		setInvoiceNumber("");
		setWorkflowStatus("");
		setNumber("");
		setLoading(false);
	};
	return (
		<div>
			{!companyName && (
				<div>
					<InputField
						label="Vendor Pan Number"
						id="panNumber"
						name="panNumber"
						placeholder="Enter PAN Number"
						value={panNumber}
						onChange={handlePanChange}
					/>
					<button style={{ padding: 4 }} onClick={fetchCompanyData}>
						{loading ? "Getting..." : "Get Company Name"}
					</button>
				</div>
			)}
			{companyName && (
				<div>
					<p style={{ marginBottom: 10 }}>
						<strong>Company Name:</strong> {companyName}
					</p>
					{workflowStatus && (
						<div style={{ marginBottom: 20 }}>
							<p>
								<strong>Invoice Number:</strong> {number}
							</p>
							<p style={{ color: "green", marginTop: 10 }}>
								<strong>Status:</strong>{" "}
								{workflowStatus === "New" ? "Invoice under approval" : workflowStatus}
							</p>
						</div>
					)}
					<div style={{ marginTop: 20 }}>
						<InputField
							label="Invoice Number"
							id="invoiceNumber"
							name="invoiceNumber"
							placeholder="Enter Invoice Number"
							value={invoiceNumber}
							onChange={handleInvoiceChange}
						/>
						<button style={{ padding: 4 }} onClick={fetchInvoiceStatus}>
							{loading ? "Checking..." : "Check Invoice Status"}
						</button>
					</div>
					{workflowStatus && (
						<p
							style={{
								color: "#007BFF",
								cursor: "pointer",
								textDecoration: "underline",
								display: "inline-block",
								borderRadius: "4px",
								backgroundColor: "#f8f9fa",
								fontSize: "14px",
								marginTop: 20,
							}}
							onClick={resetForm}
						>
							Check with Another Pan Number
						</p>
					)}
				</div>
			)}
		</div>
	);
}

export default CheckInvoiceStatus;
