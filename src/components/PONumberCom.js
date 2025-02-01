import React, { useEffect, useState } from "react";
import { Checkbox, FormGroup } from "@mui/material";

const PurchaseOrderCheckboxes = ({
	poMap,
	setSelectedPoNumbers,
	poLoader,
	purchaseOrderNumber,
	selectedPoNumbers,
}) => {
	const [mergedSelectedPoNumbers, setMergedSelectedPoNumbers] = useState([]);
	useEffect(() => {
		if (purchaseOrderNumber?.length > 0) {
			setMergedSelectedPoNumbers(purchaseOrderNumber);
			setSelectedPoNumbers(purchaseOrderNumber);
		} else {
			setMergedSelectedPoNumbers([]);
		}
	}, [purchaseOrderNumber]);

	const handleCheckboxChange = (event, po) => {
		const isChecked = event.target.checked;
		const updatedSelection = isChecked
			? [...mergedSelectedPoNumbers, po]
			: mergedSelectedPoNumbers.filter((selectedPo) => selectedPo.number !== po.number);

		setMergedSelectedPoNumbers(updatedSelection);
		setSelectedPoNumbers(updatedSelection);
	};

	return (
		<div className="form-group">
			<div style={{ display: "flex", alignItems: "center", marginBottom: "0px" }}>
				<label htmlFor="purchaseOrderNumber" style={{ fontWeight: "bold" }}>
					Purchase Order Number
					<span style={{ color: "red", marginLeft: "5px" }}>*</span>
				</label>
			</div>
			<FormGroup style={{ paddingLeft: "0" }}>
				{poLoader ? (
					<p>Loading POs...</p>
				) : poMap?.length > 0 ? (
					poMap.map((po, index) => {
						const isChecked = mergedSelectedPoNumbers.some(
							(selectedPo) => selectedPo.number === po.number
						);

						return (
							<div key={index} style={{ display: "flex", alignItems: "center" }}>
								<Checkbox
									checked={isChecked}
									onChange={(e) => handleCheckboxChange(e, po)}
									name={po.number}
									color="primary"
									style={{ padding: "0", marginRight: "8px" }}
								/>
								<span
									style={{
										fontSize: "13.5px",
										marginLeft: "0",
										color: "#333",
									}}
								>
									{po.number}
								</span>
							</div>
						);
					})
				) : (
					<p>No open POs for the selected vendor</p>
				)}
			</FormGroup>
		</div>
	);
};

export default PurchaseOrderCheckboxes;
