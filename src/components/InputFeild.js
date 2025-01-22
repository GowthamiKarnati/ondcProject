// import React from 'react';

// const InputFeild = ({ label, isRequired, id, name, placeholder, value, onChange, onBlur }) => {
//     return (
//         <div className="form-group">
//             <div style={{ display: 'flex', alignItems: 'center' }}>
//                 <label htmlFor={id}>{label}</label>
//                 {isRequired && <p style={{ color: 'red', margin: '0 0 0 5px', position: 'relative', top: '-3px' }}>*</p>}
//             </div>
//             <input
//                 type="text"
//                 id={id}
//                 name={name}
//                 className="form-input"
//                 placeholder={placeholder}
//                 value={value}
//                 onChange={onChange}
//                 {...(onBlur && { onBlur })}
//             />
//         </div>
//     );
// };

// export default InputFeild;
import React from 'react';

const InputField = ({
  label,
  isRequired = false,
  id,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  additionalContent, // Additional JSX (e.g., buttons or messages)
}) => {
  return (
    <div className="form-group">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <label htmlFor={id}>{label}</label>
        {isRequired && (
          <p
            style={{
              color: 'red',
              margin: '0 0 0 5px',
              position: 'relative',
              top: '-3px',
            }}
          >
            *
          </p>
        )}
      </div>
      <input
        type={type}
        id={id}
        name={name}
        className="form-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...(onBlur && { onBlur })}
      />
      {additionalContent && <>{additionalContent}</>}
    </div>
  );
};

export default InputField;

