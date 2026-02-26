import React, { useState } from 'react';
import '../styles/output-panel.css';

const OutputPanel = ({
    output,
    errors = [],
    isLoading = false,
    executionResult = null,
    aiSuggestions = null,
    codeStats = null,
    onShowDiff = null
}) => {
    const [activeTab, setActiveTab] = useState('output');

    const tabs = [
        {
            id: 'output',
            label: 'OUTPUT',
            icon: '',
            count: (executionResult && executionResult.success && errors.length === 0 && output && output.trim()) ? 1 : 0
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
                                {/* Code Analysis Display */}
                                {aiSuggestions.type === 'code_analysis' ? (
                                    <>
                                        {aiSuggestions.explanation && (
                                            <div className="ai-section analysis-section">
                                                <div className="ai-header">
                                                    <span className="section-icon">📖</span>
                                                    Code Explanation
                                                </div>
                                                <p className="ai-text">{aiSuggestions.explanation}</p>
                                            </div>
                                        )}

                                        {(aiSuggestions.time_complexity || aiSuggestions.space_complexity) && (
                                            <div className="ai-section complexity-section">
                                                <div className="ai-header">
                                                    <span className="section-icon">⚡</span>
                                                    Complexity Analysis
                                                </div>
                                                <div className="complexity-grid">
                                                    {aiSuggestions.time_complexity && (
                                                        <div className="complexity-item">
                                                            <div className="complexity-label">
                                                                <span className="complexity-icon">⏱️</span>
                                                                Time Complexity
                                                            </div>
                                                            <div className="complexity-value">{aiSuggestions.time_complexity}</div>
                                                        </div>
                                                    )}
                                                    {aiSuggestions.space_complexity && (
                                                        <div className="complexity-item">
                                                            <div className="complexity-label">
                                                                <span className="complexity-icon">💾</span>
                                                                Space Complexity
                                                            </div>
                                                            <div className="complexity-value">{aiSuggestions.space_complexity}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {aiSuggestions.optimizations && aiSuggestions.optimizations.length > 0 && (
                                            <div className="ai-section optimizations-section">
                                                <div className="ai-header">
                                                    <span className="section-icon">🚀</span>
                                                    Optimization Suggestions
                                                </div>
                                                <ul className="optimization-list">
                                                    {aiSuggestions.optimizations.map((opt, index) => (
                                                        <li key={index} className="optimization-item">
                                                            <span className="optimization-bullet">💡</span>
                                                            {opt}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {/* Regular AI suggestions (for debug fixes) */}
                                        {aiSuggestions.explanation && (
                                            <div className="ai-section">
                                                <div className="ai-header">Explanation</div>
                                                <p className="ai-text">{aiSuggestions.explanation}</p>
                                            </div>
                                        )}
                                    </>
                                )}

                                {aiSuggestions.fixed_code && (
                                    <div className="ai-section">
                                        <div className="ai-header-with-action">
                                            <div className="ai-header">Fixed Code</div>
                                            {onShowDiff && aiSuggestions.fixed_code.trim() && (
                                                <button
                                                    className="show-diff-btn"
                                                    onClick={() => onShowDiff(aiSuggestions.fixed_code)}
                                                    title="Show changes in editor"
                                                >
                                                    Show in Editor
                                                </button>
                                            )}
                                        </div>
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