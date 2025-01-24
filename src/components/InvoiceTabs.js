import React from "react";

function InvoiceTabs({ activeTab, handleTabChange }) {
	return (
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
            <button
				className={`tab ${activeTab === "check-status" ? "active" : ""}`}
				onClick={() => handleTabChange("check-status")}
			>
				Check Invoice Status
			</button>
		</div>
	);
}

export default InvoiceTabs;
