import React from 'react';
import { explainCode } from "../api/debugApi";

const ExplainButton = ({ code, language, onExplain, onResult, isLoading = false }) => {
    const handleClick = async () => {
        if (!isLoading && code && language) {
            if (onExplain) {
                onExplain();
            }

            try {
                const result = await explainCode(code, language);
                if (onResult) {
                    onResult(result);
                }
            } catch (error) {
                console.error('Explain API error:', error);
                if (onResult) {
                    onResult({ error: 'Failed to explain code' });
                }
            }
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            style={{
                padding: '12px 30px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#fff',
                backgroundColor: isLoading ? '#6c757d' : '#28a745',
                border: 'none',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s ease',
                minWidth: '150px'
            }}
            onMouseOver={(e) => {
                if (!isLoading) {
                    e.target.style.backgroundColor = '#218838';
                }
            }}
            onMouseOut={(e) => {
                if (!isLoading) {
                    e.target.style.backgroundColor = '#28a745';
                }
            }}
        >
            {isLoading ? (
                <span>
                    Explaining...
                </span>
            ) : (
                <span>
                    Explain My Code
                </span>
            )}
        </button>
    );
};

export default ExplainButton;