import React, { useState } from 'react';

const DebugButton = ({ onDebug, isLoading = false }) => {
    const handleClick = () => {
        if (!isLoading && onDebug) {
            onDebug();
        }
    };

    return (
        <div style={{
            padding: '20px',
            textAlign: 'center',
            borderTop: '1px solid #e0e0e0'
        }}>
            <button
                onClick={handleClick}
                disabled={isLoading}
                style={{
                    padding: '12px 30px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#fff',
                    backgroundColor: isLoading ? '#6c757d' : '#007acc',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.3s ease',
                    minWidth: '120px'
                }}
                onMouseOver={(e) => {
                    if (!isLoading) {
                        e.target.style.backgroundColor = '#005a9e';
                    }
                }}
                onMouseOut={(e) => {
                    if (!isLoading) {
                        e.target.style.backgroundColor = '#007acc';
                    }
                }}
            >
                {isLoading ? (
                    <span>
                        Debugging...
                    </span>
                ) : (
                    <span>
                        Debug Code
                    </span>
                )}
            </button>
        </div>
    );
};

export default DebugButton;