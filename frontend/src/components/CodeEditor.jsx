import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getFileContent, updateFileContent } from "../api/project";
import { executeCode } from "../api/execute";
import { useSocketStore } from "../store/useSocketStore";

// Syntax highlighting keywords and patterns
const syntaxKeywords = {
  py: {
    keywords: new Set([
      "def",
      "class",
      "if",
      "else",
      "elif",
      "while",
      "for",
      "in",
      "try",
      "except",
      "finally",
      "with",
      "as",
      "import",
      "from",
      "return",
      "break",
      "continue",
      "pass",
      "raise",
      "yield",
      "async",
      "await",
      "True",
      "False",
      "None",
      "and",
      "or",
      "not",
      "is",
      "lambda",
    ]),
    builtins: new Set([
      "print",
      "len",
      "range",
      "str",
      "int",
      "float",
      "list",
      "dict",
      "set",
      "tuple",
      "open",
      "enumerate",
      "zip",
      "map",
      "filter",
      "sorted",
      "sum",
      "max",
      "min",
      "abs",
      "round",
      "pow",
      "divmod",
      "all",
      "any",
    ]),
  },
  js: {
    keywords: new Set([
      "const",
      "let",
      "var",
      "function",
      "class",
      "if",
      "else",
      "for",
      "while",
      "do",
      "switch",
      "case",
      "break",
      "continue",
      "return",
      "try",
      "catch",
      "finally",
      "throw",
      "new",
      "this",
      "super",
      "import",
      "export",
      "default",
      "async",
      "await",
      "true",
      "false",
      "null",
      "undefined",
      "typeof",
      "instanceof",
    ]),
    builtins: new Set([
      "console",
      "Math",
      "Array",
      "Object",
      "String",
      "Number",
      "Boolean",
      "Date",
      "RegExp",
      "JSON",
      "Promise",
      "Set",
      "Map",
      "parseInt",
      "parseFloat",
      "isNaN",
      "isFinite",
      "eval",
      "encodeURI",
      "decodeURI",
    ]),
  },
  java: {
    keywords: new Set([
      "public",
      "private",
      "protected",
      "class",
      "interface",
      "extends",
      "implements",
      "static",
      "final",
      "void",
      "int",
      "long",
      "float",
      "double",
      "boolean",
      "char",
      "String",
      "if",
      "else",
      "for",
      "while",
      "do",
      "switch",
      "case",
      "break",
      "continue",
      "return",
      "try",
      "catch",
      "finally",
      "throw",
      "new",
      "this",
      "super",
      "import",
      "package",
      "true",
      "false",
      "null",
    ]),
    builtins: new Set([
      "System",
      "Math",
      "String",
      "Integer",
      "Double",
      "Boolean",
      "Character",
      "ArrayList",
      "HashMap",
      "HashSet",
      "LinkedList",
      "Arrays",
      "Collections",
      "Scanner",
      "File",
      "BufferedReader",
      "BufferedWriter",
    ]),
  },
  cpp: {
    keywords: new Set([
      "int",
      "float",
      "double",
      "char",
      "void",
      "bool",
      "string",
      "class",
      "struct",
      "enum",
      "union",
      "namespace",
      "template",
      "typename",
      "const",
      "static",
      "extern",
      "inline",
      "virtual",
      "override",
      "final",
      "public",
      "private",
      "protected",
      "if",
      "else",
      "for",
      "while",
      "do",
      "switch",
      "case",
      "break",
      "continue",
      "return",
      "try",
      "catch",
      "throw",
      "new",
      "delete",
      "this",
      "using",
      "typedef",
      "auto",
      "decltype",
      "nullptr",
      "true",
      "false",
    ]),
    builtins: new Set([
      "cout",
      "cin",
      "endl",
      "string",
      "vector",
      "map",
      "set",
      "list",
      "deque",
      "queue",
      "stack",
      "priority_queue",
      "array",
      "tuple",
      "pair",
      "make_pair",
      "sort",
      "find",
      "count",
      "max",
      "min",
      "abs",
      "pow",
      "sqrt",
      "sin",
      "cos",
    ]),
  },
};

const getLanguageFromExtension = (filename) => {
  const extension = filename?.split(".").pop()?.toLowerCase();
  return extension;
};

const highlightCode = (code, language) => {
  if (!code || !language || !syntaxKeywords[language]) return code;

  const keywords = syntaxKeywords[language];
  let highlightedCode = code;

  // Split code into tokens while preserving whitespace and special characters
  const tokens = highlightedCode.split(/(\s+|[(){}[\];,.<>+\-*/%&|^!~=?:])/);

  // Process each token
  highlightedCode = tokens.map(token => {
    // Skip empty tokens and whitespace
    if (!token || /^\s+$/.test(token)) return token;

    // Handle brackets and punctuation
    if (/^[(){}\[\];,]$/.test(token)) {
      return `<span class="text-yellow-400">${token}</span>`;
    }

    // Handle operators
    if (/^[.<>+\-*/%&|^!~=?:]$/.test(token)) {
      return `<span class="text-pink-400">${token}</span>`;
    }

    // Check if token is a keyword
    if (keywords.keywords.has(token)) {
      return `<span class="text-purple-400">${token}</span>`;
    }
    
    // Check if token is a builtin
    if (keywords.builtins.has(token)) {
      return `<span class="text-blue-400">${token}</span>`;
    }

    // Handle numbers
    if (/^\d+(\.\d+)?$/.test(token)) {
      return `<span class="text-orange-400">${token}</span>`;
    }

    // Handle strings (both single and double quotes)
    if (/^["'].*["']$/.test(token)) {
      return `<span class="text-green-400">${token}</span>`;
    }

    // Handle comments
    if (token.startsWith('//') || token.startsWith('/*') || token.startsWith('#')) {
      return `<span class="text-amber-300">${token}</span>`;
    }

    return `<span class="text-white">${token}</span>`;
  }).join('');

  return highlightedCode;
};

const CodeEditor = ({ selectedFile, onFileSelect }) => {
  const { projectId } = useParams();
  const [code, setCode] = useState("");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [lineNumbers, setLineNumbers] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [highlightedCode, setHighlightedCode] = useState("");
  const { 
    socket, 
    isConnected,
    emitFileUpdate, 
    onFileUpdate, 
    clearListeners, 
    connectSocket, 
    disconnectSocket,
    joinProject,
    leaveProject 
  } = useSocketStore();

  // Handle socket connection and project room
  useEffect(() => {
    if (selectedFile && projectId) {
      // Connect socket if not connected
      if (!isConnected) {
        connectSocket();
      }

      // Join project room
      joinProject(projectId);

      // Set up file update listener
      const handleFileUpdate = (data) => {
        if (data.projectId === projectId && data.fileId === selectedFile._id) {
          setCode(data.code);
          updateLineNumbers(data.code);
        }
      };

      onFileUpdate(handleFileUpdate);

      // Cleanup
      return () => {
        leaveProject(projectId);
        clearListeners();
      };
    }
  }, [selectedFile, projectId, isConnected, connectSocket, joinProject, leaveProject, onFileUpdate, clearListeners]);

  // Handle socket disconnection when component unmounts
  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnectSocket();
      }
    };
  }, [isConnected, disconnectSocket]);

  useEffect(() => {
    if (selectedFile) {
      fetchFileContent();
      // Clear history when file changes
      setHistory([]);
      setHistoryIndex(-1);
    }
  }, [selectedFile, projectId]);

  useEffect(() => {
    const language = getLanguageFromExtension(selectedFile?.name);
    setHighlightedCode(highlightCode(code, language));
  }, [code, selectedFile]);

  const fetchFileContent = async () => {
    try {
      const response = await getFileContent(projectId, selectedFile._id);
      if (response.success && response.data) {
        const content = response.data.content || "";
        setCode(content);
        updateLineNumbers(content);
        // Initialize history with the initial content
        setHistory([content]);
        setHistoryIndex(0);
      } else {
        console.error("Invalid response format:", response);
        setCode("");
        updateLineNumbers("");
        setHistory([""]);
        setHistoryIndex(0);
      }
    } catch (error) {
      console.error("Error fetching file content:", error);
      setCode("");
      updateLineNumbers("");
      setHistory([""]);
      setHistoryIndex(0);
    }
  };

  const handleEditorChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    updateLineNumbers(newCode);

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newCode);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // Auto save and emit socket update
    debouncedSave(newCode);
    if (selectedFile) {
      emitFileUpdate(projectId, selectedFile._id, newCode);
    }
  };

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (content) => {
      try {
        await updateFileContent(projectId, selectedFile._id, content);
      } catch (error) {
        console.error("Error auto-saving file:", error);
      }
    }, 1000),
    [projectId, selectedFile]
  );

  // Undo function
  const handleUndo = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCode(history[newIndex]);
        updateLineNumbers(history[newIndex]);
        if (selectedFile) {
          emitFileUpdate(projectId, selectedFile._id, history[newIndex]);
        }
      }
    }
  };

  // Debounce utility function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const updateLineNumbers = (content) => {
    if (!content) {
      setLineNumbers([1]);
      return;
    }
    const lines = content.split("\n");
    setLineNumbers(Array.from({ length: lines.length }, (_, i) => i + 1));
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleClose = () => {
    onFileSelect(null);
  };

  const handleKeyDown = (e) => {
    // Tab support
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + "  " + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
      return;
    }

    // Enter key with indentation
    if (e.key === "Enter") {
      e.preventDefault();
      const start = e.target.selectionStart;
      const currentLine = code.substring(0, start).split("\n").pop();
      const indentMatch = currentLine.match(/^[ \t]*/);
      const currentIndent = indentMatch ? indentMatch[0] : "";

      const newCode =
        code.substring(0, start) + "\n" + currentIndent + code.substring(start);
      setCode(newCode);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd =
          start + currentIndent.length + 1;
      }, 0);
      return;
    }

    // Auto-completion pairs
    const pairs = {
      "(": ")",
      "[": "]",
      "{": "}",
      '"': '"',
      "'": "'",
      "`": "`",
    };
    const openers = Object.keys(pairs);
    const closers = Object.values(pairs);
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;

    // Auto-insert closing pair
    if (openers.includes(e.key)) {
      e.preventDefault();
      const close = pairs[e.key];
      const newCode =
        code.substring(0, start) + e.key + close + code.substring(end);
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
      const response = await executeCode(
        getLanguageFromExtension(selectedFile?.name || ""),
        code,
        inputText
      );

      setOutputText(response.result);
    } catch (error) {
      setOutputText("Error executing code.");
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
      <div className="mx-2 sm:mx-[30px] my-2 sm:my-4 rounded-lg border border-zinc-800 bg-black flex-1 min-h-[200px] w-full max-w-full overflow-hidden" style={{ height: 'calc(100% - 200px)' }}>
        <div className="flex h-full w-full max-w-full">
          <div className="w-8 sm:w-12 bg-zinc-900 text-zinc-500 text-right pr-1 sm:pr-2 py-2 select-none border-r border-zinc-800 rounded-l-lg">
            <div className="sticky top-0">
              {lineNumbers.map((num) => (
                <div key={num} className="text-xs sm:text-sm">{num}</div>
              ))}
            </div>
          </div>
          <div className="flex-1 relative h-full overflow-hidden max-w-full">
            <div className="relative w-full h-full overflow-auto" id="editor-container">
              <textarea
                value={code}
                onChange={handleEditorChange}
                onKeyDown={(e) => {
                  handleKeyDown(e);
                  handleUndo(e);
                }}
                onScroll={(e) => {
                  const container = document.getElementById('editor-container');
                  if (container) {
                    container.scrollTop = e.target.scrollTop;
                  }
                }}
                spellCheck={false}
                className="w-full h-full min-h-full p-2 sm:p-4 bg-transparent text-transparent caret-white font-mono text-xs sm:text-sm outline-none resize-none whitespace-pre-wrap break-words max-w-full"
                placeholder="Start typing your code here..."
                style={{ 
                  boxSizing: 'border-box', 
                  width: '100%', 
                  minWidth: 0, 
                  maxWidth: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 1,
                  overflow: 'scroll'
                }}
              />
              <pre
                className="w-full h-full min-h-full p-2 sm:p-4 font-mono text-xs sm:text-sm whitespace-pre-wrap break-words pointer-events-none"
                style={{
                  boxSizing: 'border-box',
                  width: '100%',
                  minWidth: 0,
                  maxWidth: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 0,
                  overflow: 'scroll'
                }}
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
              />
            </div>
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
            className="w-full h-40 p-2 sm:p-4 bg-zinc-900 text-blue-300 border border-zinc-700 rounded-b-lg resize-none focus:outline-none text-xs sm:text-sm font-mono"
            placeholder="Enter input here..."
            style={{ minHeight: '160px', maxHeight: '160px' }}
          />
        </div>

        <div className="flex-1 mt-2 sm:mt-0">
          <div className="bg-zinc-800 text-white px-2 sm:px-4 py-2 rounded-t-lg border-b border-zinc-700">
            <h2 className="text-lg font-medium">Output</h2>
          </div>
          <div 
            className="w-full h-40 p-2 sm:p-4 bg-zinc-900 border border-zinc-700 rounded-b-lg overflow-auto whitespace-pre-wrap font-mono text-xs sm:text-sm text-orange-300"
            style={{ minHeight: '160px', maxHeight: '160px' }}
          >
            {outputText || '// Output will appear here...'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
