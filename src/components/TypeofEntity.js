import React from "react";

const TypeOfEntity = ({
  typeOfEntity,
  setTypeOfEntity,
  cinNo,
  setCinNo,
  handleFileChange,
  uploadCoi
}) => {
  return (
    <div>
      <div className="form-group">
        <div style={{ display: "flex", alignItems: "center" }}>
          <label htmlFor="type-of-entity" className="form-label">
            Type of Entity
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
        <select
          id="type-of-entity"
          name="type-of-entity"
          className="form-input"
          value={typeOfEntity}
          onChange={(e) => setTypeOfEntity(e.target.value)}
        >
          <option value="" disabled>
            Select Entity Type
          </option>
          <option value="Private Limited">Private Limited</option>
          <option value="Public Limited">Public Limited</option>
          <option value="LLP">LLP</option>
          <option value="Sole Proprietorship">Sole Proprietorship</option>
          <option value="Partnership">Partnership</option>
          <option value="HUF">HUF</option>
          <option value="Section 8">Section 8</option>
          <option value="Societies">Societies</option>
          <option value="Trust">Trust</option>
          <option value="Self Help Group">Self Help Group</option>
        </select>
      </div>

      {/* Conditional Rendering for CIN No. and COI */}
      {["Private Limited", "Public Limited", "Section 8"].includes(
        typeOfEntity
      ) && (
        <>
         <div className="input-group">
          <div className="form-group">
            <div style={{ display: "flex", alignItems: "center" }}>
              <label htmlFor="cin-no" className="form-label">
                CIN No.
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
              id="cin-no"
              name="cin-no"
              className="form-input"
              //placeholder="Enter CIN No."
              value={cinNo}
              onChange={(e) => setCinNo(e.target.value)}
            />
          </div>
          <div className="form-group">
            <div style={{ display: "flex", alignItems: "center" }}>
              <label htmlFor="coi-attachment" className="form-label">
                Certificate of Incorporation (COI)
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
              id="coi-attachment"
              name="coi-attachment"
              className="form-input"
              onChange={(e) => handleFileChange(e, "coi")}
            />
            {uploadCoi && <div style={{color:'green', marginBottom:'10px'}}>Uploading...</div>}
          </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TypeOfEntity;
