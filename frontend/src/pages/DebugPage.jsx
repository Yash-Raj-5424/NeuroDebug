import React, { useState } from 'react';
import CodeEditor from '../components/CodeEditor';
import LanguageSelector from '../components/LanguageSelector';
import DebugButton from '../components/DebugButton';
import { parseErrors } from '../utils/errorParser';

const DebugPage = () => {
    const [selectedLanguage, setSelectedLanguage] = useState('python');
    const [code, setCode] = useState('# Welcome to NeuroDebug!\nprint("Hello, World!")');
    const [output, setOutput] = useState('');
    const [isDebugging, setIsDebugging] = useState(false);
    const [errors, setErrors] = useState([]);

    const handleLanguageChange = (language) => {
        setSelectedLanguage(language);
        // Set default code based on language
        const defaultCode = getDefaultCodeForLanguage(language);
        setCode(defaultCode);
        setOutput(''); // Clear output when language changes
        setErrors([]); // Clear errors when language changes
    };

    const getDefaultCodeForLanguage = (language) => {
        const defaults = {
            javascript: '// Welcome to NeuroDebug!\nconsole.log("Hello, World!");',
            typescript: '// Welcome to NeuroDebug!\nfunction greet(name: string): string {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("World"));',
            python: '# Welcome to NeuroDebug!\nprint("Hello, World!")',
            java: '// Welcome to NeuroDebug!\npublic class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
            cpp: '// Welcome to NeuroDebug!\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
            c: '// Welcome to NeuroDebug!\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
            csharp: '// Welcome to NeuroDebug!\nusing System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}',
            go: '// Welcome to NeuroDebug!\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
            rust: '// Welcome to NeuroDebug!\nfn main() {\n    println!("Hello, World!");\n}',
            php: '<?php\n// Welcome to NeuroDebug!\necho "Hello, World!";\n?>',
            html: '<!-- Welcome to NeuroDebug! -->\n<!DOCTYPE html>\n<html>\n<head>\n    <title>Hello World</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>',
            css: '/* Welcome to NeuroDebug! */\nbody {\n    font-family: Arial, sans-serif;\n    background-color: #f0f0f0;\n    text-align: center;\n    padding: 50px;\n}\n\nh1 {\n    color: #333;\n}',
            json: '{\n  "message": "Hello, World!",\n  "language": "json",\n  "debug": true\n}',
            xml: '<?xml version="1.0" encoding="UTF-8"?>\n<!-- Welcome to NeuroDebug! -->\n<root>\n    <message>Hello, World!</message>\n</root>',
            sql: '-- Welcome to NeuroDebug!\nSELECT \'Hello, World!\' as message;'
        };
        return defaults[language] || '// Welcome to NeuroDebug!\n// Start coding here...';
    };

    const handleDebugStart = () => {
        setIsDebugging(true);
        setOutput('🔄 Analyzing code...\n');
        setErrors([]); // Clear previous errors
    };

    const handleDebugResult = (result) => {
        setIsDebugging(false);

        if (result.error) {
            setOutput(`❌ Error: ${result.error}\n\nPlease check if the backend server is running.`);
            setErrors([]);
        } else {
            // Parse and format the API response
            const { message, result: executionResult, ai_fix } = result;

            // Parse errors for highlighting
            const parsedErrors = [];
            if (executionResult && !executionResult.success) {
                const errorText = executionResult.stderr || executionResult.error;
                if (errorText) {
                    const parsed = parseErrors(errorText, selectedLanguage);
                    parsedErrors.push(...parsed);
                }
            }
            setErrors(parsedErrors);

            let debugOutput = `📊 Debug Analysis Complete!\n\n`;
            debugOutput += `Language: ${selectedLanguage.toUpperCase()}\n`;
            debugOutput += `Lines of code: ${code.split('\\n').length}\n`;
            debugOutput += `Characters: ${code.length}\n\n`;

            // Execution Results
            if (executionResult) {
                debugOutput += `🔧 Execution Status: ${executionResult.success ? '✅ SUCCESS' : '❌ FAILED'}\n\n`;

                if (executionResult.execution_time) {
                    debugOutput += `⏱️ Execution Time: ${executionResult.execution_time}\n\n`;
                }

                // Standard Output
                if (executionResult.stdout) {
                    debugOutput += `📤 Output:\n${executionResult.stdout}\n\n`;
                }

                // Error Output
                if (executionResult.stderr) {
                    debugOutput += `⚠️ Errors:\n${executionResult.stderr}\n\n`;

                    // Add error highlighting info if errors were found
                    if (parsedErrors.length > 0) {
                        debugOutput += `🎯 Found ${parsedErrors.length} error(s) highlighted in the editor\n\n`;
                    }
                }

                // General Error
                if (executionResult.error) {
                    debugOutput += `❌ Error Details:\n${executionResult.error}\n\n`;
                }
            }

            // AI Suggestions
            if (ai_fix) {
                debugOutput += `🤖 AI Suggestions:\n`;
                if (ai_fix.explanation) {
                    debugOutput += `💡 Explanation: ${ai_fix.explanation}\n\n`;
                }
                if (ai_fix.fixed_code) {
                    debugOutput += `✨ Suggested Fix:\n${ai_fix.fixed_code}\n\n`;
                }
                if (ai_fix.suggestions && ai_fix.suggestions.length > 0) {
                    debugOutput += `📋 Additional Tips:\n`;
                    ai_fix.suggestions.forEach((tip, index) => {
                        debugOutput += `${index + 1}. ${tip}\n`;
                    });
                    debugOutput += `\n`;
                }
            }

            // If no specific output, show success message
            if (!executionResult?.stdout && !executionResult?.stderr && !executionResult?.error && executionResult?.success) {
                debugOutput += `✅ Code executed successfully with no output.\n`;
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
    };

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
            </div>

            {/* Code Editor */}
            <div style={{
                flex: 1,
                minHeight: '400px',
                maxHeight: 'calc(100vh - 300px)',
                backgroundColor: '#1e1e1e',
                border: '1px solid #333',
                overflow: 'hidden'
            }}>
                <CodeEditor
                    language={selectedLanguage}
                    value={code}
                    onChange={handleCodeChange}
                    errors={errors}
                />
            </div>

            {/* Debug Button */}
            <DebugButton
                code={code}
                language={selectedLanguage}
                onDebug={handleDebugStart}
                onResult={handleDebugResult}
                isLoading={isDebugging}
            />

            {/* Output Section */}
            <div style={{
                height: '200px',
                backgroundColor: '#1e1e1e',
                color: '#fff',
                padding: '15px',
                overflow: 'auto',
                borderTop: '1px solid #333',
                fontFamily: 'monospace',
                fontSize: '14px',
                whiteSpace: 'pre-wrap'
            }}>
                <div style={{
                    marginBottom: '10px',
                    fontWeight: 'bold',
                    color: '#007acc'
                }}>
                    Output:
                </div>
                {output || 'No output yet. Click "Debug Code" to analyze your code.'}
            </div>
        </div>
    );
};

export default DebugPage;