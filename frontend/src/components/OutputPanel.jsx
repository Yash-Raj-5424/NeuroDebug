import React, { useState } from 'react';
import '../styles/output-panel.css';

const OutputPanel = ({
    output,
    errors = [],
    isLoading = false,
    executionResult = null,
    aiSuggestions = null,
    codeStats = null
}) => {
    const [activeTab, setActiveTab] = useState('output');

    // Always available tabs
    const tabs = [
        {
            id: 'output',
            label: 'OUTPUT',
            icon: '',
            count: (executionResult && executionResult.success && errors.length === 0) ? 1 : 0
        },
        {
            id: 'problems',
            label: 'PROBLEMS',
            icon: '',
            count: errors.length
        },
        {
            id: 'ai',
            label: 'AI ASSISTANT',
            icon: '',
            count: (aiSuggestions && (aiSuggestions.explanation || aiSuggestions.fixed_code)) ? 1 : 0
        }
    ];

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
    };

    const renderTabContent = () => {
        if (isLoading) {
            return (
                <div className="tab-content">
                    <div className="loading-content">
                        <div className="loading-spinner"></div>
                        <span>Analyzing code...</span>
                    </div>
                </div>
            );
        }

        switch (activeTab) {
            case 'output':
                return (
                    <div className="tab-content">
                        {(executionResult && executionResult.success && errors.length === 0) ? (
                            <pre className="output-text">
                                {output || 'Code executed successfully with no output.'}
                            </pre>
                        ) : (
                            <div className="empty-state">
                                <span className="empty-icon">OUTPUT</span>
                                <p>Output will appear here when code runs successfully without errors</p>
                            </div>
                        )}
                    </div>
                );

            case 'problems':
                return (
                    <div className="tab-content">
                        {errors.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">OK</span>
                                <p>No problems detected</p>
                            </div>
                        ) : (
                            <div className="problems-list">
                                {errors.map((error, index) => (
                                    <div key={index} className="problem-item">
                                        <div className="problem-icon">
                                            {error.severity === 'error' ? 'ERR' : 'WARN'}
                                        </div>
                                        <div className="problem-details">
                                            <div className="problem-message">{error.message}</div>
                                            <div className="problem-location">
                                                Line {error.line}, Column {error.column}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );



            case 'ai':
                return (
                    <div className="tab-content">
                        {!aiSuggestions || (!aiSuggestions.explanation && !aiSuggestions.fixed_code) ? (
                            <div className="empty-state">
                                <span className="empty-icon">AI</span>
                                <p>AI suggestions will appear here when code is analyzed</p>
                            </div>
                        ) : (
                            <div className="ai-suggestions">
                                {/* Confidence Score */}
                                {aiSuggestions.confidence && (
                                    <div className="ai-confidence">
                                        <div className="confidence-header">
                                            <span className="confidence-icon">TARGET</span>
                                            <span>Confidence Score</span>
                                        </div>
                                        <div className="confidence-bar">
                                            <div
                                                className="confidence-fill"
                                                style={{ width: `${aiSuggestions.confidence}%` }}
                                            ></div>
                                            <span className="confidence-text">{aiSuggestions.confidence}%</span>
                                        </div>
                                    </div>
                                )}

                                {aiSuggestions.explanation && (
                                    <div className="ai-section">
                                        <div className="ai-header">Explanation</div>
                                        <p className="ai-text">{aiSuggestions.explanation}</p>
                                    </div>
                                )}

                                {aiSuggestions.fixed_code && (
                                    <div className="ai-section">
                                        <div className="ai-header">Fixed Code</div>
                                        <pre className="ai-code">{aiSuggestions.fixed_code}</pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );

            default:
                return (
                    <div className="tab-content">
                        <div className="empty-state">
                            <span className="empty-icon">DEBUG</span>
                            <p>Click "Debug Code" to analyze your code</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="output-panel">
            <div className="tab-bar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => handleTabClick(tab.id)}
                        title={tab.label}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        <span className="tab-label">{tab.label}</span>
                        {tab.count > 0 && (
                            <span className="tab-count">{tab.count}</span>
                        )}
                    </button>
                ))}
            </div>
            <div className="tab-content-container">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default OutputPanel;