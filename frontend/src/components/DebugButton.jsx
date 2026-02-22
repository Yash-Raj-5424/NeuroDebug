import React, { useState } from 'react';
import { debugCode } from "../api/debugApi";

const DebugButton = ({ code, language, onDebug, onResult, isLoading = false }) => {
    const handleClick = async () => {
        if (!isLoading && code && language) {
            if (onDebug) {
                onDebug(); // Call onDebug to start the debugging process
            }

            try {
                const result = await debugCode(code, language);
                if (onResult) {
                    onResult(result);
                }
            } catch (error) {
                console.error('Debug API error:', error);
                if (onResult) {
                    onResult({ error: 'Failed to debug code' });
                }
            }
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