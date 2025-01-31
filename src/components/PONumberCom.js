// import React from "react";
// import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";

// const PurchaseOrderCheckboxes = ({
// 	poMap,
// 	selectedPoNumbers = [],
// 	setSelectedPoNumbers,
// 	poLoader,
// 	purchaseOrderNumber,
// }) => {
// 	console.log("ponumb", poMap);
// 	console.log("in child com", selectedPoNumbers);
// 	console.log("pur", purchaseOrderNumber);
// 	const handleCheckboxChange = (event, po) => {
//         // If checkbox is checked, add the PO to selectedPoNumbers
//         if (event.target.checked) {
//           setSelectedPoNumbers((prevSelected) => [...prevSelected, po]);
//         } else {
//           // If unchecked, remove the PO from selectedPoNumbers
//           setSelectedPoNumbers((prevSelected) =>
//             prevSelected.filter((selectedPo) => selectedPo.number !== po.number)
//           );
//         }
//       };
      

// 	return (
// 		<div className="form-group">
// 			<div style={{ display: "flex", alignItems: "center", marginBottom: "0px" }}>
// 				<label htmlFor="purchaseOrderNumber" style={{ fontWeight: "bold" }}>
// 					Purchase Order Number
// 					<span style={{ color: "red", marginLeft: "5px" }}>*</span>
// 				</label>
// 			</div>
// 			<FormGroup style={{ paddingLeft: "0" }}>
// 				{poLoader ? (
// 					<p>Loading POs...</p>
// 				) : poMap?.length > 0 ? (
// 					poMap.map((po, index) => {
// 						// Check if the PO is in the purchaseOrderNumber (this will be pre-checked)
// 						const isChecked = purchaseOrderNumber.some((p) => p?.number === po?.number);

// 						return (
// 							<div key={index} style={{ display: "flex", alignItems: "center" }}>
// 								<Checkbox
// 									checked={isChecked} // Checkboxes will be pre-selected if they exist in purchaseOrderNumber
// 									onChange={(e) => handleCheckboxChange(e, po)} // Allow the user to update the selection
// 									name={po.number}
// 									color="primary"
// 									style={{ padding: "0", marginRight: "8px" }} // Adjust checkbox margin
// 								/>
// 								<span
// 									style={{
// 										fontSize: "13.5px",
// 										marginLeft: "0",
// 										color: "#333",
// 									}}
// 								>
// 									{po.number}
// 								</span>
// 							</div>
// 						);
// 					})
// 				) : (
// 					<p>No POs available/select the vendor name</p>
// 				)}
// 			</FormGroup>

// 			{purchaseOrderNumber?.length > 0 ? (
// 				<div style={{ marginTop: 20 }}>
// 					<strong>Current PO Numbers:</strong>
// 					<ul>
// 						{purchaseOrderNumber.map((po, index) => (
// 							<p key={po?.id || index} style={{ fontSize: 13, color: "gray" }}>
// 								{po?.number || "Unknown PO Number"}
// 							</p>
// 						))}
// 					</ul>
// 				</div>
// 			) : (
// 				<p>No avaliable please select above</p>
// 			)}
// 		</div>
// 	);
// };

// export default PurchaseOrderCheckboxes;
import React, { useEffect, useState } from "react";
import { Checkbox, FormGroup } from "@mui/material";

const PurchaseOrderCheckboxes = ({
  poMap,
  setSelectedPoNumbers,
  poLoader,
  purchaseOrderNumber,
}) => {
  const [mergedSelectedPoNumbers, setMergedSelectedPoNumbers] = useState([]);
  useEffect(() => {
    if (purchaseOrderNumber?.length > 0) {
      setMergedSelectedPoNumbers(purchaseOrderNumber);
    } else {
      setMergedSelectedPoNumbers([]); 
    }
  }, [purchaseOrderNumber]);


  const handleCheckboxChange = (event, po) => {
    const isChecked = event.target.checked;
    const updatedSelection = isChecked
      ? [...mergedSelectedPoNumbers, po] 
      : mergedSelectedPoNumbers.filter(
          (selectedPo) => selectedPo.number !== po.number
        ); 

    setMergedSelectedPoNumbers(updatedSelection);
    setSelectedPoNumbers(updatedSelection); 
  };

  return (
    <div className="form-group">
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "0px" }}
      >
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
          <p>No POs available/select the vendor name</p>
        )}
      </FormGroup>
    </div>
  );
};

export default PurchaseOrderCheckboxes;
