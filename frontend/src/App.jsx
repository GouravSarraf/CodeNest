import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ProjectsPage from './components/ProjectsPage';
import FileExplorer from './components/FileExplorer';
import CodeEditor from './components/CodeEditor';
import { authAPI } from './api/api';
import InvitePage from './components/InvitePage';

// Protected Route Component


 
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    checkAuth();
    // Set initial sidebar state based on screen size
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#222831' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#00ADB5' }}></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen" style={{ background: '#222831' }}>
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
            path="/projects/invite/:inviteId" 
            element={
              isAuthenticated ? (
                <InvitePage />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/projects/:projectId" 
            element={
              isAuthenticated ? (
                <div className="flex h-screen" style={{ background: '#222831' }}>
                  {/* Mobile Sidebar Toggle */}
                  {!isSidebarOpen && (
                    <button
                      onClick={() => setIsSidebarOpen(true)}
                      className="fixed top-4 left-4 z-50 p-2 rounded-lg shadow-lg md:hidden border"
                      style={{ background: '#393E46', borderColor: '#00ADB5' }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        style={{ color: '#00ADB5' }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    </button>
                  )}

                  {/* Sidebar Overlay */}
                  {isSidebarOpen && (
                    <div
                      className="fixed inset-0 z-40 md:hidden"
                      style={{ background: 'rgba(0,0,0,0.5)' }}
                      onClick={() => setIsSidebarOpen(false)}
                    />
                  )}

                  {/* File Explorer Sidebar */}
                  <div
                    className={`fixed md:static inset-y-0 left-0 z-40 w-64 border-r transform transition-transform duration-200 ease-in-out ${
                      isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:translate-x-0`}
                    style={{ background: '#393E46', borderColor: '#00ADB5' }}
                  >
                    <FileExplorer 
                      onFileSelect={setSelectedFile} 
                      onBack={() => setIsSidebarOpen(false)}
                    />
                  </div>
                  
                  {/* Code Editor Area */}
                  <div className="flex-1 overflow-hidden md:mt-0 mt-14">
                    {selectedFile ? (
                      <CodeEditor selectedFile={selectedFile} onFileSelect={setSelectedFile} />
                    ) : (
                      <div className="h-full flex items-center justify-center" style={{ color: '#00ADB5' }}>
                        Select a file to start editing
                      </div>
                    )}
                  </div>
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