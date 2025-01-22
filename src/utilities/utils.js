import axios from "axios";
const baseUrl = process.env.REACT_APP_BASE_URL;

export const fetchVendorNames = async (cleanedValue) => {
	try {
		const encodedValue = encodeURIComponent(cleanedValue);
		const response = await axios.get(`${baseUrl}/api/vendor/vendor-info?cleanedValue=${encodedValue}`);
		return response.data.data.map((vendor) => ({
			id: vendor.record_id,
			name: vendor["Legal Entity Name"],
		}));
	} catch (err) {
		console.error("Error in fetchVendorNames:", err);
		//throw err;
	}
};
export const uploadBase64ToBackend = async (base64Data, mimeType) => {
	try {
		const response = await axios.post(
			`${baseUrl}/api/vendor/file-upload`,
			{ base64Data, mimeType },
			{
				headers: {
					"Content-Type": "application/json",
				},
			}
		);
		return response.data;
	} catch (err) {
		console.error("Error uploading base64 file:", err);
		//throw err;
	}
};
export const fetchPocData = async (emailValue) => {
	try {
		const verifiedValue = encodeURIComponent(emailValue);
		const response = await axios.get(`${baseUrl}/api/vendor/poc-name?verifyValue=${verifiedValue}`);
		return response.data.data.map((poc) => ({
			id: poc.record_id,
			name: poc.Name,
		}));
	} catch (error) {
		console.error("Error fetching POC data:", error);
		//throw error;
	}
};
export const fetchInvoiceDataUtil = async (baseUrl, invoiceNumber) => {
	try {
		const encodedValue = encodeURIComponent(invoiceNumber.trim());
		if (!encodedValue) {
			throw new Error("Invoice number is empty.");
		}
		const response = await axios.get(`${baseUrl}/api/vendor/get-invoice-data?number=${encodedValue}`);
		if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
			const invoiceData = response.data.data[0];
			const attachments = JSON.parse(invoiceData["Invoice Attachment"] || "[]");
			const serviceAttachments = JSON.parse(invoiceData["Service Acceptance File"] || "[]");
			let pocDetails = null;
			if (invoiceData["ONDC Point of Contact"]) {
				const encodedPoc = encodeURIComponent(invoiceData["ONDC Point of Contact"]);
				const pocResponse = await axios.get(`${baseUrl}/api/vendor/get-poc-email?name=${encodedPoc}`);
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
				},
				pocDetails,
			};
		} else {
			throw new Error("No data found for the entered Invoice Value.");
		}
	} catch (error) {
		throw new Error(error.message || "Error fetching invoice data.");
	}
};
export const isInvoiceExists = async (baseUrl, invoiceNumber) => {
	const encodedValue = encodeURIComponent(invoiceNumber);
	try {
		const response = await axios.get(`${baseUrl}/api/vendor/get-invoice-data?number=${encodedValue}`);
		return response.data?.data?.length > 0;
	} catch (error) {
		console.error("Error while checking invoice existence:", error);
		throw new Error("An error occurred while checking the invoice number. Please try again.");
	}
};
export const submitInvoice = async (baseUrl, uploadType, payload) => {
	const url =
		uploadType === "new-upload"
			? `${baseUrl}/api/vendor/upload-invoice`
			: `${baseUrl}/api/vendor/update-invoice`;

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
		const response = await axios.get(`${baseUrl}/api/vendor/get-po-numbers?vendorName=${vendorName}`);
		return response.data.data.map((po) => ({
			number: po["PO Number"],
		}));
	} catch (error) {
		console.error("Error fetching PO Numbers:", error);
		//throw error;
	}
};
