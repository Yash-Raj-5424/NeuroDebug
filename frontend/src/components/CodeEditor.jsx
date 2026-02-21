import React, { useState } from 'react';
import { Editor } from '@monaco-editor/react';

const CodeEditor = ({ language, value, onChange, theme = 'vs-dark' }) => {
    const [isEditorReady, setIsEditorReady] = useState(false);
    const [editorError, setEditorError] = useState(null);

    const handleEditorChange = (value) => {
        onChange(value || '');
    };

    const handleEditorDidMount = (editor, monaco) => {
        console.log('Monaco Editor mounted successfully');
        setIsEditorReady(true);
    };

    const handleEditorWillMount = (monaco) => {
        console.log('Monaco Editor before mount');
    };

    const editorOptions = {
        selectOnLineNumbers: true,
        roundedSelection: false,
        readOnly: false,
        cursorStyle: 'line',
        automaticLayout: true,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineNumbers: 'on',
        glyphMargin: true,
        folding: true,
        lineDecorationsWidth: 20,
        lineNumbersMinChars: 3,
        renderWhitespace: 'selection',
    };

    return (
        <div style={{
            height: '100%',
            width: '100%',
            minHeight: '400px',
            backgroundColor: '#1e1e1e',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <Editor
                height="100%"
                width="100%"
                language={language}
                value={value}
                theme={theme}
                onChange={handleEditorChange}
                options={editorOptions}
                onMount={handleEditorDidMount}
                beforeMount={handleEditorWillMount}
                loading={
                    <div style={{
                        padding: '20px',
                        textAlign: 'center',
                        color: '#fff',
                        backgroundColor: '#1e1e1e',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column'
                    }}>
                        <div>Loading Monaco Editor...</div>
                        <div style={{ fontSize: '12px', marginTop: '10px', opacity: 0.7 }}>
                            Language: {language}
                        </div>
                    </div>
                }
            />
            {!isEditorReady && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#fff',
                    zIndex: 1000,
                    display: 'none'
                }}>
                    Fallback: Editor loading...
                </div>
            )}
        </div>
    );
};

export default CodeEditor;