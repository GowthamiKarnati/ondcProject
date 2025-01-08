import React from 'react';

const InputFeild = ({ label, isRequired, id, name, placeholder, value, onChange }) => {
    return (
        <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <label htmlFor={id} className="form-label">{label}</label>
                {isRequired && <p style={{ color: 'red', margin: '0 0 0 5px', position: 'relative', top: '-3px' }}>*</p>}
            </div>
            <input
                type="text"
                id={id}
                name={name}
                className="form-input"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
    );
};

export default InputFeild;
