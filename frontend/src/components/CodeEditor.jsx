import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getFileContent, updateFileContent } from '../api/project';

const getLanguageFromExtension = (filename) => {
  const extension = filename?.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'js':
    case 'jsx': return 'javascript';
    case 'ts':
    case 'tsx': return 'typescript';
    case 'html': return 'html';
    case 'css': return 'css';
    case 'json': return 'json';
    case 'md': return 'markdown';
    case 'py': return 'python';
    case 'java': return 'java';
    case 'c': return 'c';
    case 'cpp': return 'cpp';
    case 'cs': return 'csharp';
    case 'go': return 'go';
    case 'rs': return 'rust';
    case 'php': return 'php';
    case 'rb': return 'ruby';
    case 'swift': return 'swift';
    case 'kt': return 'kotlin';
    case 'scala': return 'scala';
    case 'sh': return 'shell';
    case 'sql': return 'sql';
    case 'xml': return 'xml';
    case 'yaml':
    case 'yml': return 'yaml';
    default: return 'plaintext';
  }
};

const CodeEditor = ({ selectedFile, onFileSelect }) => {
  const { projectId } = useParams();
  const [code, setCode] = useState('');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [lineNumbers, setLineNumbers] = useState([]);

  useEffect(() => {
    if (selectedFile) {
      fetchFileContent();
    }
  }, [selectedFile, projectId]);

  const fetchFileContent = async () => {
    try {
      const response = await getFileContent(projectId, selectedFile._id);
      if (response.success && response.data) {
        
        setCode(response.data.content || '');
        updateLineNumbers(response.data.content || '');
      } else {
        console.error('Invalid response format:', response);
        setCode('');
        updateLineNumbers('');
      }
    } catch (error) {
      console.error('Error fetching file content:', error);
      setCode('');
      updateLineNumbers('');
    }
  };

  const handleEditorChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    updateLineNumbers(newCode);
  };

  const updateLineNumbers = (content) => {
    if (!content) {
      setLineNumbers([1]);
      return;
    }
    const lines = content.split('\n');
    setLineNumbers(Array.from({ length: lines.length }, (_, i) => i + 1));
  };

  const handleSave = async () => {
    try {
      await updateFileContent(projectId, selectedFile._id, code);
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleClose = () => {
    onFileSelect(null);
  };

  const handleKeyDown = (e) => {
    // Tab support
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
      return;
    }

    // Auto-completion pairs
    const pairs = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
      '`': '`',
    };
    const openers = Object.keys(pairs);
    const closers = Object.values(pairs);
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;

    // Auto-insert closing pair
    if (openers.includes(e.key)) {
      e.preventDefault();
      const close = pairs[e.key];
      const newCode = code.substring(0, start) + e.key + close + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 1;
      }, 0);
      return;
    }

    // Skip over closing if already present
    if (closers.includes(e.key)) {
      if (code[end] === e.key) {
        e.preventDefault();
        setTimeout(() => {
          e.target.selectionStart = e.target.selectionEnd = end + 1;
        }, 0);
      }
    }
  };

  const handleRun = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          input: inputText,
          language: getLanguageFromExtension(selectedFile?.name || ''),
        }),
      });
      const data = await response.json();
      setOutputText(data.output);
    } catch (err) {
      setOutputText('Error executing code.');
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-[775px] bg-black overflow-x-hidden w-full max-w-full">
      {/* Top Bar */}
      <div className="bg-zinc-900 text-white px-2 sm:px-4 py-2 flex justify-between items-center border-b border-zinc-800">
        <h2 className="text-lg font-medium truncate max-w-[60vw]">{selectedFile?.name || 'No file selected'}</h2>
        <div className="flex gap-2">
          {selectedFile && (
            <>
              <button
                onClick={handleSave}
                className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                Save
              </button>
              <button
                onClick={handleRun}
                className="px-2 sm:px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm sm:text-base"
              >
                Run
              </button>
              <button
                onClick={handleClose}
                className="px-2 sm:px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm sm:text-base"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="mx-2 sm:mx-[30px] my-2 sm:my-4 rounded-lg border border-zinc-800 bg-black flex-1 min-h-[200px] w-full max-w-full" style={{ height: 'auto' }}>
        <div className="flex h-full w-full max-w-full">
          <div className="w-8 sm:w-12 bg-zinc-900 text-zinc-500 text-right pr-1 sm:pr-2 py-2 select-none overflow-hidden border-r border-zinc-800 rounded-l-lg">
            {lineNumbers.map((num) => (
              <div key={num} className="text-xs sm:text-sm">{num}</div>
            ))}
          </div>
          <div className="flex-1 relative h-full overflow-auto max-w-full">
            <textarea
              value={code}
              onChange={handleEditorChange}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className="w-full h-full min-h-full p-2 sm:p-4 bg-black text-white font-mono text-xs sm:text-sm outline-none resize-none whitespace-pre-wrap break-words max-w-full"
              placeholder="Start typing your code here..."
              style={{ boxSizing: 'border-box', width: '100%', minWidth: 0, maxWidth: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Input and Output */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-2 sm:p-4 bg-zinc-900 border-t border-zinc-800">
        <div className="flex-1">
          <div className="bg-zinc-800 text-white px-2 sm:px-4 py-2 rounded-t-lg border-b border-zinc-700">
            <h2 className="text-lg font-medium">Input</h2>
          </div>
          <textarea
            value={inputText}
            onChange={handleInputChange}
            className="w-full h-24 sm:h-32 p-2 sm:p-4 bg-zinc-900 text-white border border-zinc-700 rounded-b-lg resize-none focus:outline-none text-xs sm:text-sm"
            placeholder="Enter input here..."
          />
        </div>

        <div className="flex-1 mt-2 sm:mt-0">
          <div className="bg-zinc-800 text-white px-2 sm:px-4 py-2 rounded-t-lg border-b border-zinc-700">
            <h2 className="text-lg font-medium">Output</h2>
          </div>
          <div className="w-full h-24 sm:h-32 p-2 sm:p-4 bg-zinc-900 text-white border border-zinc-700 rounded-b-lg overflow-auto whitespace-pre-wrap font-mono text-xs sm:text-sm">
            <SyntaxHighlighter language="text" style={vscDarkPlus} customStyle={{ background: 'transparent' }}>
              {outputText || '// Output will appear here...'}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
