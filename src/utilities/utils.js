import axios from "axios";

export const fetchVendorNames = async (cleanedValue) => {
	try {
		const encodedValue = encodeURIComponent(cleanedValue);
		const response = await axios.get(`/api/vendor/vendor-info?cleanedValue=${encodedValue}`);
		return response.data.data.map((vendor) => ({
			id: vendor.record_id,
			name: vendor["Legal Entity Name"],
		}));
	} catch (err) {
		console.log("Error in fetchVendorNames:", err);
		throw new Error("Failed to fetch company name.");
	}
};
export const uploadBase64ToBackend = async (base64Data, mimeType) => {
	try {
		const response = await axios.post(
			`/api/vendor/file-upload`,
			{ base64Data, mimeType },
			{
				headers: {
					"Content-Type": "application/json",
				},
			}
		);
		return response.data;
	} catch (err) {
		alert(`${err.response.data.error}`);
		return;
	}
};
export const fetchPocData = async (emailValue) => {
	try {
		const verifiedValue = encodeURIComponent(emailValue);
		const response = await axios.get(`/api/vendor/poc-name?verifyValue=${verifiedValue}`);
		return response.data.data.map((poc) => ({
			id: poc.record_id,
			name: poc.Name,
		}));
	} catch (error) {
		console.error("Error fetching POC data:", error);
		//throw error;
	}
};
export const fetchInvoiceDataUtil = async (invoiceNumber, companyName) => {
	try {
		const encodedValue = encodeURIComponent(invoiceNumber.trim());
		const encodedCompanyName = encodeURIComponent(companyName.trim());
		if (!encodedValue) {
			throw new Error("Invoice number is empty.");
		}
		const response = await axios.get(
			`/api/vendor/get-invoice-data?number=${encodedValue}&companyName=${encodedCompanyName}`
		);
		const invoiceData = response.data.data;
		if (invoiceData && Object.keys(invoiceData).length > 0) {
			const attachments = JSON.parse(invoiceData["Invoice Attachment"] || "[]");
			const serviceAttachments = JSON.parse(invoiceData["Service Acceptance File"] || "[]");
			let pocDetails = null;
			if (invoiceData["ONDC Point of Contact"]) {
				const encodedPoc = encodeURIComponent(invoiceData["ONDC Point of Contact"]);
				const pocResponse = await axios.get(`/api/vendor/get-poc-email?name=${encodedPoc}`);
				if (pocResponse.data.data.length > 0) {
					pocDetails = {
						email: pocResponse.data.data[0].Email,
						data: pocResponse.data.data.map((poc) => ({
							id: poc.record_id,
							name: poc.Name,
						})),
					};
				}
			}

			return {
				invoiceData: {
					recordId: invoiceData["record_id"],
					vendorPAN: invoiceData["Vendor PAN"] || "",
					vendorName: invoiceData["Vendor"] || "",
					invoiceDate: invoiceData["Invoice Date"]?.split(" ")[0] || "",
					poNumber: invoiceData["PO Number"] || "",
					invoiceValue: invoiceData["Invoice Value"] || "",
					invoiceNumber: invoiceData["Invoice Number"] || "",
					attachments: attachments,
					filePath: attachments.length > 0 ? attachments[0].path : "",
					serviceAttachments: serviceAttachments,
					serviceFilePath: serviceAttachments.length > 0 ? serviceAttachments[0].path : "",
					workflowStatus: invoiceData["Workflow Status"] || "",
					poNumbers: invoiceData["PO Numbers"] || "",
				},
				pocDetails,
			};
		} else {
			throw new Error(
				"No data found for the entered Invoice Number.Check the invoice Number and Company Name"
			);
		}
	} catch (error) {
		throw new Error(error.message || "Error fetching invoice data.");
	}
};
export const isInvoiceExists = async (invoiceNumber, companyName) => {
	const encodedValue = encodeURIComponent(invoiceNumber);
	const encodedCompanyName = encodeURIComponent(companyName.trim());
	try {
		const response = await axios.get(
			`/api/vendor/get-invoice-data?number=${encodedValue}&companyName=${encodedCompanyName}`
		);
		return response.data?.data && Object.keys(response.data.data).length > 0;
	} catch (error) {
		console.error("Error while checking invoice existence:", error);
		throw new Error("An error occurred while checking the invoice number. Please try again.");
	}
};
export const submitInvoice = async (uploadType, payload) => {
	const url = uploadType === "new-upload" ? `/api/vendor/upload-invoice` : `/api/vendor/update-invoice`;

	try {
		const response = await axios.post(url, payload, {
			headers: {
				"Content-Type": "application/json",
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error submitting invoice:", error);
		throw new Error("An error occurred while submitting the invoice. Please try again.");
	}
};
export const fetchNumbers = async (vendorName) => {
	try {
		const response = await axios.get(`/api/vendor/get-po-numbers?vendorName=${vendorName}`);
		return response.data.data.map((po) => ({
			id: po.record_id,
			number: po["PO Number"],
		}));
	} catch (error) {
		console.error("Error fetching PO Numbers:", error);
		//throw error;
	}
};
