import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@monaco-editor/react';

const CodeEditor = ({ language, value, onChange, errors = [], theme = 'vs-dark' }) => {
    const [isEditorReady, setIsEditorReady] = useState(false);
    const [editorError, setEditorError] = useState(null);
    const editorRef = useRef(null);

    const handleEditorChange = (value) => {
        onChange(value || '');
    };

    const handleEditorDidMount = (editor, monaco) => {
        console.log('Monaco Editor mounted successfully');
        editorRef.current = { editor, monaco };
        setIsEditorReady(true);
    };

    const handleEditorWillMount = (monaco) => {
        console.log('Monaco Editor before mount');
    };

    // Error highlighting effect
    useEffect(() => {
        if (!editorRef.current || !errors) return;

        const { editor, monaco } = editorRef.current;
        const model = editor.getModel();

        if (!model) return;

        // Clear existing markers
        monaco.editor.removeAllMarkers('error-highlight');

        // Add new error markers if there are any
        if (errors.length > 0) {
            const markers = errors.map((error, index) => ({
                startLineNumber: Math.max(1, error.line),
                startColumn: Math.max(1, error.column || 1),
                endLineNumber: Math.max(1, error.line),
                endColumn: error.endColumn || model.getLineMaxColumn(Math.max(1, error.line)),
                message: error.message || 'Error detected',
                severity: monaco.MarkerSeverity.Error,
                source: 'NeuroDebug'
            }));

            monaco.editor.setModelMarkers(model, 'error-highlight', markers);

            // Scroll to first error if there are errors
            if (errors.length > 0) {
                const firstError = errors[0];
                editor.revealLineInCenter(firstError.line);
            }
        }
    }, [errors]);

    // Clear markers when component unmounts
    useEffect(() => {
        return () => {
            if (editorRef.current) {
                const { monaco } = editorRef.current;
                monaco.editor.removeAllMarkers('error-highlight');
            }
        };
    }, []);

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
        // Enable error highlighting
        renderValidationDecorations: 'on',
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
            {/* Error indicator */}
            {errors && errors.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#ff1212',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    zIndex: 1000,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                    {errors.length} Error{errors.length > 1 ? 's' : ''}
                </div>
            )}
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