import React, { useState } from 'react';
import CodeEditor from '../components/CodeEditor';
import LanguageSelector from '../components/LanguageSelector';
import DebugButton from '../components/DebugButton';

const DebugPage = () => {
    const [selectedLanguage, setSelectedLanguage] = useState('python');
    const [code, setCode] = useState('# Welcome to NeuroDebug!\nprint("Hello, World!")');
    const [output, setOutput] = useState('');
    const [isDebugging, setIsDebugging] = useState(false);

    const handleLanguageChange = (language) => {
        setSelectedLanguage(language);
        // Set default code based on language
        const defaultCode = getDefaultCodeForLanguage(language);
        setCode(defaultCode);
        setOutput(''); // Clear output when language changes
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

    const handleDebug = async () => {
        setIsDebugging(true);
        setOutput('🔄 Analyzing code...\n');

        // Simulate debugging process
        setTimeout(() => {
            const debugOutput = `📊 Debug Analysis Complete!\n\n` +
                `Language: ${selectedLanguage.toUpperCase()}\n` +
                `Lines of code: ${code.split('\\n').length}\n` +
                `Characters: ${code.length}\n` +
                `Non-empty lines: ${code.split('\\n').filter(line => line.trim().length > 0).length}\n\n` +
                `✅ Syntax analysis: No errors detected\\n` +
                `💡 Suggestions: Code looks good!\\n` +
                `🔍 Performance: No issues found\\n\\n` +
                `Ready for execution! 🚀`;

            setOutput(debugOutput);
            setIsDebugging(false);
        }, 2000);
    };

    const handleCodeChange = (newCode) => {
        setCode(newCode);
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
                />
            </div>

            {/* Debug Button */}
            <DebugButton onDebug={handleDebug} isLoading={isDebugging} />

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