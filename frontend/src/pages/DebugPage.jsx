import React, { useState, useEffect, useCallback } from 'react';
import CodeEditor from '../components/CodeEditor';
import LanguageSelector from '../components/LanguageSelector';
import DebugButton from '../components/DebugButton';
import ExplainButton from '../components/ExplainButton';
import OutputPanel from '../components/OutputPanel';
import DiffViewer from '../components/DiffViewer';
import { parseErrors } from '../utils/errorParser';

const DebugPage = () => {
    const [selectedLanguage, setSelectedLanguage] = useState('python');
    const [code, setCode] = useState('print("Hello, World!")');
    const [output, setOutput] = useState('');
    const [isDebugging, setIsDebugging] = useState(false);
    const [isExplaining, setIsExplaining] = useState(false);
    const [errors, setErrors] = useState([]);
    const [executionResult, setExecutionResult] = useState(null);
    const [aiSuggestions, setAiSuggestions] = useState(null);
    const [codeExplanation, setCodeExplanation] = useState(null);
    const [codeStats, setCodeStats] = useState(null);
    const [outputHeight, setOutputHeight] = useState(200);
    const [isResizing, setIsResizing] = useState(false);
    const [showDiffView, setShowDiffView] = useState(false);
    const [originalCodeForDiff, setOriginalCodeForDiff] = useState('');
    const [fixedCodeForDiff, setFixedCodeForDiff] = useState('');

    const handleLanguageChange = (language) => {
        setSelectedLanguage(language);
        const defaultCode = getDefaultCodeForLanguage(language);
        setCode(defaultCode);
        setOutput('');
        setErrors([]);
        setExecutionResult(null);
        setAiSuggestions(null);
        setCodeExplanation(null);
        setCodeStats(null);
        setShowDiffView(false);
        setOriginalCodeForDiff('');
        setFixedCodeForDiff('');
    };

    const getDefaultCodeForLanguage = (language) => {
        const defaults = {
            javascript: 'console.log("Hello, World!");',
            typescript: 'function greet(name: string): string {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("World"));',
            python: 'print("Hello, World!")',
            java: 'public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
            cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
            c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
            csharp: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}',
            go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
            rust: 'fn main() {\n    println!("Hello, World!");\n}',
            php: '<?php\necho "Hello, World!";\n?>',
            html: '<!-- Welcome to NeuroDebug! -->\n<!DOCTYPE html>\n<html>\n<head>\n    <title>Hello World</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>',
            css: 'body {\n    font-family: Arial, sans-serif;\n    background-color: #f0f0f0;\n    text-align: center;\n    padding: 50px;\n}\n\nh1 {\n    color: #333;\n}',
            json: '{\n  "message": "Hello, World!",\n  "language": "json",\n  "debug": true\n}',
            xml: '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n    <message>Hello, World!</message>\n</root>',
            sql: 'SELECT \'Hello, World!\' as message;'
        };
        return defaults[language] || 'console.log("Start coding here...");';
    };

    const handleDebugStart = () => {
        setIsDebugging(true);
        setOutput('Analyzing code...\n');
        setErrors([]);
        setExecutionResult(null);
        setAiSuggestions(null);
        setCodeStats(null);
    };

    const handleExplainStart = () => {
        setIsExplaining(true);
        setOutput('Analyzing code structure and complexity...\n');
        setCodeExplanation(null);
    };

    const handleExplainResult = (result) => {
        setIsExplaining(false);

        if (result.error) {
            setOutput(`ERROR: ${result.error}\n\nPlease check if the backend server is running.`);
            setCodeExplanation(null);
            setAiSuggestions(null);
        } else {
            const { explanation, time_complexity, space_complexity, optimizations } = result;

            setCodeExplanation(result);

            // Structure explanation data for appealing display in AI assistant tab
            setAiSuggestions({
                explanation: explanation,
                time_complexity: time_complexity,
                space_complexity: space_complexity,
                optimizations: optimizations || [],
                type: 'code_analysis'
            });

            setOutput('');
        }
    };

    const handleDebugResult = (result) => {
        setIsDebugging(false);

        if (result.error) {
            setOutput(`ERROR: ${result.error}\n\nPlease check if the backend server is running.`);
            setErrors([]);
            setExecutionResult(null);
            setAiSuggestions(null);
            setCodeStats(null);
        } else {
            const { message, result: executionResult, ai_fix } = result;

            const stats = {
                lines: code.split('\n').length,
                characters: code.length
            };
            setCodeStats(stats);

            const parsedErrors = [];
            if (executionResult && !executionResult.success) {
                const errorText = executionResult.stderr || executionResult.error;
                if (errorText) {
                    const parsed = parseErrors(errorText, selectedLanguage);
                    parsedErrors.push(...parsed);
                }
            }
            setErrors(parsedErrors);

            setExecutionResult(executionResult);

            if (ai_fix) {
                setAiSuggestions(ai_fix);
            } else {
                setAiSuggestions(null);
            }

            // Create simplified output for the OUTPUT tab (only for successful execution)
            let debugOutput = '';
            if (executionResult && executionResult.success && parsedErrors.length === 0) {
                debugOutput = `Analysis Complete!\n\n`;
                debugOutput += `Language: ${selectedLanguage.toUpperCase()}\n`;
                debugOutput += `Lines of code: ${stats.lines}\n`;
                debugOutput += `Characters: ${stats.characters}\n\n`;

                if (executionResult.execution_time) {
                    debugOutput += `Execution Time: ${executionResult.execution_time}\n\n`;
                }

                // Standard Output
                if (executionResult.stdout) {
                    debugOutput += `Output:\n${executionResult.stdout}\n`;
                } else {
                    debugOutput += `Code executed successfully with no output.\n`;
                }
            }

            setOutput(debugOutput);
        }
    };

    const handleCodeChange = (newCode) => {
        setCode(newCode);
        // Clear errors when code changes (user is editing)
        if (errors.length > 0) {
            setErrors([]);
        }
        // Exit diff view if user starts editing
        if (showDiffView) {
            setShowDiffView(false);
            setOriginalCodeForDiff('');
            setFixedCodeForDiff('');
        }
    };

    // Diff view handlers
    const handleShowDiff = (fixedCode) => {
        setOriginalCodeForDiff(code);
        setFixedCodeForDiff(fixedCode);
        setShowDiffView(true);
    };

    const handleKeepChanges = (newCode) => {
        setCode(newCode);
        setShowDiffView(false);
        setOriginalCodeForDiff('');
        setFixedCodeForDiff('');
        // Clear errors as we're applying AI fix
        setErrors([]);
    };

    const handleDiscardChanges = () => {
        setShowDiffView(false);
        setOriginalCodeForDiff('');
        setFixedCodeForDiff('');
    };

    // Resizing functionality
    const handleMouseMove = useCallback((e) => {
        console.log('Mouse move event triggered');

        // Get the current mouse position
        const mouseY = e.clientY;

        // Get window height
        const windowHeight = window.innerHeight;

        // Calculate how much space should be for the output panel
        // Distance from bottom of window to mouse position
        const newOutputHeight = Math.max(150, Math.min(600, windowHeight - mouseY - 10));

        console.log('Mouse Y:', mouseY, 'Window Height:', windowHeight, 'New Output Height:', newOutputHeight);
        setOutputHeight(newOutputHeight);
    }, []);

    const handleMouseUp = useCallback(() => {
        console.log('Mouse up - ending resize');
        setIsResizing(false);
        document.body.classList.remove('resizing');
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);

    const handleMouseDown = useCallback((e) => {
        console.log('Mouse down - starting resize');
        setIsResizing(true);
        document.body.classList.add('resizing');
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        e.preventDefault();
    }, [handleMouseMove, handleMouseUp]);

    // Cleanup event listeners on component unmount
    useEffect(() => {
        return () => {
            document.body.classList.remove('resizing');
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{
                backgroundColor: '#1e1e1e',
                color: '#fff',
                padding: '15px 20px',
                fontSize: '24px',
                fontWeight: 'bold',
                textAlign: 'center',
                borderBottom: '2px solid #007acc'
            }}>
                NeuroDebug
            </div>

            {/* Language Selector */}
            <div style={{
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #e0e0e0'
            }}>
                <LanguageSelector
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={handleLanguageChange}
                />
                {showDiffView && (
                    <div style={{
                        backgroundColor: '#007acc',
                        color: '#ffffff',
                        padding: '4px 10px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textAlign: 'center'
                    }}>
                        DIFF MODE: Reviewing AI Code Suggestions
                    </div>
                )}
            </div>

            {/* Code Editor / Diff Viewer */}
            <div style={{
                flex: 1,
                minHeight: '300px',
                height: `calc(100vh - ${160 + outputHeight}px)`,
                backgroundColor: '#1e1e1e',
                border: '1px solid #333',
                overflow: 'hidden'
            }}>
                {showDiffView ? (
                    <DiffViewer
                        originalCode={originalCodeForDiff}
                        fixedCode={fixedCodeForDiff}
                        language={selectedLanguage}
                        onKeep={handleKeepChanges}
                        onDiscard={handleDiscardChanges}
                        theme="vs-dark"
                    />
                ) : (
                    <CodeEditor
                        language={selectedLanguage}
                        value={code}
                        onChange={handleCodeChange}
                        errors={errors}
                    />
                )}
            </div>

            {/* Action Buttons */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '20px',
                borderTop: '1px solid #e0e0e0',
                gap: '10px'
            }}>
                <DebugButton
                    code={code}
                    language={selectedLanguage}
                    onDebug={handleDebugStart}
                    onResult={handleDebugResult}
                    isLoading={isDebugging}
                />
                <ExplainButton
                    code={code}
                    language={selectedLanguage}
                    onExplain={handleExplainStart}
                    onResult={handleExplainResult}
                    isLoading={isExplaining}
                />
            </div>

            {/* Resize Handle */}
            <div
                className={`resize-handle ${isResizing ? 'resizing' : ''}`}
                onMouseDown={handleMouseDown}
                style={{
                    height: '6px',
                    backgroundColor: isResizing ? '#007acc' : '#333',
                    cursor: 'row-resize',
                    borderTop: '1px solid #444',
                    borderBottom: '1px solid #222',
                    position: 'relative',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                title={showDiffView ? 'Drag to resize. In diff view mode.' : `Drag to resize. Current height: ${outputHeight}px`}
            >
                <div style={{
                    width: '30px',
                    height: '2px',
                    backgroundColor: isResizing ? '#ffffff' : '#555',
                    borderRadius: '1px',
                    transition: 'background-color 0.2s ease'
                }} />
            </div>

            {/* Output Section */}
            <div style={{
                height: `${outputHeight}px`,
                minHeight: '150px',
                maxHeight: 'calc(100vh - 300px)',
                transition: isResizing ? 'none' : 'height 0.1s ease'
            }}>
                <OutputPanel
                    output={output}
                    errors={errors}
                    isLoading={isDebugging}
                    executionResult={executionResult}
                    aiSuggestions={aiSuggestions}
                    codeStats={codeStats}
                    onShowDiff={handleShowDiff}
                />
            </div>
        </div>
    );
};

export default DebugPage;