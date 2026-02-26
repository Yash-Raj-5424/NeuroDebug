import React from 'react';
import { Editor } from '@monaco-editor/react';
import '../styles/diff-viewer.css';

const DiffViewer = ({
    originalCode,
    fixedCode,
    language,
    onKeep,
    onDiscard,
    theme = 'vs-dark'
}) => {
    const handleKeepChanges = () => {
        if (onKeep) {
            onKeep(fixedCode);
        }
    };

    const handleDiscardChanges = () => {
        if (onDiscard) {
            onDiscard();
        }
    };

    const createDiffContent = () => {
        const originalLines = originalCode.split('\n');
        const fixedLines = fixedCode.split('\n');

        let diffContent = '';
        let lineNum = 1;

        const maxLines = Math.max(originalLines.length, fixedLines.length);

        for (let i = 0; i < maxLines; i++) {
            const originalLine = originalLines[i] || '';
            const fixedLine = fixedLines[i] || '';

            if (originalLine !== fixedLine) {
                if (originalLines[i] !== undefined) {
                    diffContent += `- ${originalLine}\n`;
                }
                if (fixedLines[i] !== undefined) {
                    diffContent += `+ ${fixedLine}\n`;
                }
            } else {
                diffContent += `  ${originalLine}\n`;
            }
        }

        return diffContent;
    };

    return (
        <div className="diff-viewer">
            <div className="diff-header">
                <div className="diff-title">
                    <span className="diff-icon">DIFF</span>
                    <span>AI Code Suggestions - Review Changes</span>
                </div>
                <div className="diff-actions">
                    <button
                        className="diff-btn discard-btn"
                        onClick={handleDiscardChanges}
                        title="Discard changes and return to original code"
                    >
                        Discard
                    </button>
                    <button
                        className="diff-btn keep-btn"
                        onClick={handleKeepChanges}
                        title="Apply changes to editor"
                    >
                        Apply Fix
                    </button>
                </div>
            </div>

            <div className="diff-content">
                <div className="diff-side">
                    <div className="diff-side-header">Original Code</div>
                    <Editor
                        height="100%"
                        language={language}
                        value={originalCode}
                        theme={theme}
                        options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            fontSize: 14,
                            lineNumbers: 'on',
                            folding: false,
                            glyphMargin: false,
                            lineDecorationsWidth: 10,
                            lineNumbersMinChars: 3
                        }}
                    />
                </div>

                <div className="diff-divider">
                    <div className="diff-divider-line"></div>
                    <div className="diff-arrow">→</div>
                    <div className="diff-divider-line"></div>
                </div>

                <div className="diff-side">
                    <div className="diff-side-header">AI Fixed Code</div>
                    <Editor
                        height="100%"
                        language={language}
                        value={fixedCode}
                        theme={theme}
                        options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            fontSize: 14,
                            lineNumbers: 'on',
                            folding: false,
                            glyphMargin: false,
                            lineDecorationsWidth: 10,
                            lineNumbersMinChars: 3
                        }}
                    />
                </div>
            </div>

            <div className="diff-footer">
                <div className="diff-legend">
                    <span className="legend-item">
                        <span className="legend-color original"></span>
                        Original Code
                    </span>
                    <span className="legend-item">
                        <span className="legend-color fixed"></span>
                        AI Fixed Code
                    </span>
                </div>
            </div>
        </div>
    );
};

export default DiffViewer;