# NeuroDebug - React Code Editor with Monaco

A powerful web-based code editor built with React and Monaco Editor that provides syntax highlighting, debugging features, and multi-language support.

## Features

- **Monaco Editor Integration**: Full-featured code editor with syntax highlighting
- **Multi-Language Support**: JavaScript, TypeScript, Python, Java, C++, C, C#, Go, Rust, PHP, HTML, CSS, JSON, XML, SQL
- **Language Selection**: Dropdown to switch between programming languages
- **Debug Functionality**: Analyze code with simulated debugging features
- **Modern UI**: Clean and professional interface with dark theme
- **Responsive Design**: Works on different screen sizes

## Architecture

```
src/
 ├── components/
 │     ├── CodeEditor.jsx      # Monaco Editor wrapper component
 │     ├── LanguageSelector.jsx # Language dropdown selector
 │     ├── DebugButton.jsx     # Debug action button
 │
 ├── pages/
 │     ├── DebugPage.jsx       # Main page layout
 │
 ├── App.jsx                   # Main application component
 ├── App.css                   # Global styles
 └── index.js                  # Application entry point
```

## UI Layout

```
 ----------------------------------
|  NeuroDebug                    |
----------------------------------
| Language Dropdown              |
----------------------------------
|                                |
|     Monaco Code Editor         |
|                                |
----------------------------------
|           Debug Button         |
----------------------------------
|       Output Section           |
----------------------------------
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and go to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Select Language**: Use the dropdown at the top to choose your programming language
2. **Write Code**: Type or paste your code in the Monaco Editor
3. **Debug**: Click the "Debug Code" button to analyze your code
4. **Review Output**: Check the output section at the bottom for analysis results

## Dependencies

- **React**: Frontend framework
- **@monaco-editor/react**: Monaco Editor integration for React
- **monaco-editor**: Microsoft's Monaco Editor
- **react-scripts**: Create React App scripts

## Development

The project uses Create React App for development and build processes. All components are modular and reusable.

### Available Scripts

- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm eject`: Eject from Create React App

## Future Enhancements

- Real code execution and debugging
- File management system
- Code sharing capabilities
- Plugin system for additional languages
- Collaborative editing features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).