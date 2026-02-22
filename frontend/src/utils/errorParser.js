/**
 * Parse error messages to extract line numbers and error descriptions
 * @param {string} errorText - The raw error text from stderr or error field
 * @param {string} language - The programming language to help with parsing
 * @returns {Array} Array of error objects with line, message, column, etc.
 */
export function parseErrors(errorText, language) {
    if (!errorText || typeof errorText !== 'string') {
        return [];
    }

    const errors = [];
    const lines = errorText.split('\n');

    switch (language.toLowerCase()) {
        case 'python':
            errors.push(...parsePythonErrors(lines));
            break;
        case 'cpp':
        case 'c++':
        case 'c':
            errors.push(...parseCppErrors(lines));
            break;
        case 'javascript':
        case 'typescript':
            errors.push(...parseJavaScriptErrors(lines));
            break;
        case 'java':
            errors.push(...parseJavaErrors(lines));
            break;
        default:
            // Generic parser for unknown languages
            errors.push(...parseGenericErrors(lines));
    }

    return errors.filter(error => error.line > 0); // Filter out invalid line numbers
}

/**
 * Parse Python error messages
 */
function parsePythonErrors(lines) {
    const errors = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Python traceback format: "  File "<filename>", line <number>, in <function>"
        const fileLineMatch = line.match(/File ".*?", line (\d+)/);
        if (fileLineMatch) {
            const lineNumber = parseInt(fileLineMatch[1]);
            let errorMessage = 'Syntax or runtime error';

            // Look for the actual error message in subsequent lines
            for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
                const nextLine = lines[j].trim();
                if (nextLine && !nextLine.startsWith('File ') && !nextLine.startsWith('^')) {
                    errorMessage = nextLine;
                    break;
                }
            }

            errors.push({
                line: lineNumber,
                column: 1,
                endColumn: 1000,
                message: errorMessage,
                severity: 'error'
            });
        }

        // Direct syntax error format: SyntaxError: invalid syntax
        if (line.includes('SyntaxError:') || line.includes('IndentationError:') || line.includes('NameError:')) {
            // Look for line number in previous lines
            let lineNumber = 1;
            for (let j = Math.max(0, i - 5); j < i; j++) {
                const prevLine = lines[j];
                const lineMatch = prevLine.match(/line (\d+)/);
                if (lineMatch) {
                    lineNumber = parseInt(lineMatch[1]);
                    break;
                }
            }

            errors.push({
                line: lineNumber,
                column: 1,
                endColumn: 1000,
                message: line,
                severity: 'error'
            });
        }
    }

    return errors;
}

/**
 * Parse C++ compiler error messages
 */
function parseCppErrors(lines) {
    const errors = [];

    for (const line of lines) {
        // GCC/Clang format: filename:line:column: error: message
        const match = line.match(/.*?:(\d+):(\d+):\s*(error|warning):\s*(.+)/);
        if (match) {
            const [, lineNum, colNum, severity, message] = match;
            errors.push({
                line: parseInt(lineNum),
                column: parseInt(colNum),
                endColumn: parseInt(colNum) + 5,
                message: message.trim(),
                severity: severity
            });
        }

        // Alternative format: filename(line,column): error message
        const altMatch = line.match(/.*?\((\d+),(\d+)\):\s*(error|warning):\s*(.+)/);
        if (altMatch) {
            const [, lineNum, colNum, severity, message] = altMatch;
            errors.push({
                line: parseInt(lineNum),
                column: parseInt(colNum),
                endColumn: parseInt(colNum) + 5,
                message: message.trim(),
                severity: severity
            });
        }
    }

    return errors;
}

/**
 * Parse JavaScript/TypeScript error messages
 */
function parseJavaScriptErrors(lines) {
    const errors = [];

    for (const line of lines) {
        // Node.js format: filename:line:column
        const nodeMatch = line.match(/.*?:(\d+):(\d+)/);
        if (nodeMatch) {
            const [, lineNum, colNum] = nodeMatch;
            let message = line.split(':').slice(3).join(':').trim() || 'JavaScript error';

            errors.push({
                line: parseInt(lineNum),
                column: parseInt(colNum),
                endColumn: parseInt(colNum) + 5,
                message: message,
                severity: 'error'
            });
        }

        // Browser format: at line:column
        const browserMatch = line.match(/at.*?(\d+):(\d+)/);
        if (browserMatch) {
            const [, lineNum, colNum] = browserMatch;
            errors.push({
                line: parseInt(lineNum),
                column: parseInt(colNum),
                endColumn: parseInt(colNum) + 5,
                message: 'JavaScript runtime error',
                severity: 'error'
            });
        }
    }

    return errors;
}

/**
 * Parse Java compiler error messages
 */
function parseJavaErrors(lines) {
    const errors = [];

    for (const line of lines) {
        // javac format: filename:line: error: message
        const match = line.match(/.*?:(\d+):\s*(error|warning):\s*(.+)/);
        if (match) {
            const [, lineNum, severity, message] = match;
            errors.push({
                line: parseInt(lineNum),
                column: 1,
                endColumn: 1000,
                message: message.trim(),
                severity: severity
            });
        }
    }

    return errors;
}

/**
 * Generic error parser for unknown languages
 */
function parseGenericErrors(lines) {
    const errors = [];

    for (const line of lines) {
        // Look for common patterns like "line 5" or ":5:"
        const lineMatch = line.match(/(?:line\s+|:)(\d+)(?::|,|\s|$)/i);
        if (lineMatch) {
            const lineNumber = parseInt(lineMatch[1]);
            const message = line.trim() || 'Error detected';

            errors.push({
                line: lineNumber,
                column: 1,
                endColumn: 1000,
                message: message,
                severity: 'error'
            });
        }
    }

    return errors;
}

/**
 * Create a simple error object for when we can't parse the error but want to show something
 */
export function createGenericError(errorMessage, lineNumber = 1) {
    return {
        line: lineNumber,
        column: 1,
        endColumn: 1000,
        message: errorMessage || 'Unknown error',
        severity: 'error'
    };
}