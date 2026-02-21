import React from 'react';

const LanguageSelector = ({ selectedLanguage, onLanguageChange }) => {
    const languages = [
        { value: 'python', label: 'Python' },
        { value: 'cpp', label: 'C++' },
    ];

    const handleLanguageChange = (event) => {
        onLanguageChange(event.target.value);
    };

    return (
        <div style={{ padding: '10px' }}>
            <label htmlFor="language-select" style={{
                marginRight: '10px',
                fontWeight: 'bold',
                color: '#333'
            }}>
                Language:
            </label>
            <select
                id="language-select"
                value={selectedLanguage}
                onChange={handleLanguageChange}
                style={{
                    padding: '8px 12px',
                    fontSize: '14px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    minWidth: '150px'
                }}
            >
                {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                        {lang.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default LanguageSelector;