import React from 'react';
import DebugPage from './pages/DebugPage';
import './App.css';
import './styles/editor-errors.css';
import './styles/output-panel.css';
import './styles/diff-viewer.css';

function App() {
    return (
        <div className="App">
            <DebugPage />
        </div>
    );
}

export default App;