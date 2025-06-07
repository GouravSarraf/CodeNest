import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ProjectsPage from './components/ProjectsPage';
import FileExplorer from './components/FileExplorer';
import CodeEditor from './components/CodeEditor';
import { authAPI } from './api/api';

// Protected Route Component


 
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setIsAuthenticated(!!response);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? (
                <LoginForm onLoginSuccess={() => setIsAuthenticated(true)} />
              ) : (
                <Navigate to="/projects" replace />
              )
            } 
          />
          <Route 
            path="/register" 
            element={
              !isAuthenticated ? (
                <RegisterForm onRegisterSuccess={() => setIsAuthenticated(true)} />
              ) : (
                <Navigate to="/projects" replace />
              )
            } 
          />

          {/* Protected routes */}
          <Route 
            path="/projects" 
            element={
              isAuthenticated ? (
                <ProjectsPage />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/projects/:projectId" 
            element={
              isAuthenticated ? (
                <div className="flex flex-col h-screen">
                  <div className="flex-1 min-h-0">
                    <FileExplorer onFileSelect={setSelectedFile} />
                  </div>
                  {selectedFile && (
                    <div className="h-[50vh] border-t border-gray-200 dark:border-gray-700">
                      <CodeEditor selectedFile={selectedFile} onFileSelect={setSelectedFile}/>
                    </div>
                  )}
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* Default route */}
          <Route 
            path="/" 
            element={
              <Navigate to={isAuthenticated ? "/projects" : "/login"} replace />
            } 
          />

          {/* Catch all route */}
          <Route 
            path="*" 
            element={
              <Navigate to={isAuthenticated ? "/projects" : "/login"} replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;