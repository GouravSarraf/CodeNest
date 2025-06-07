import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronRight, 
  Folder, 
  File, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Sparkles,
  Command,
  X,
  Loader2,
  ArrowUpRight,
  Settings,
  Bell,
  Menu,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import FileExplorer from './FileExplorer';
import { projectAPI } from '../api/api';


const ProjectsPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (projectId) {
      fetchSelectedProject();
    } else {
      fetchProjects();
    }
  }, [projectId]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await projectAPI.getAllProjects();
      if (response.success && Array.isArray(response.data)) {
        setProjects(response.data);
      } else {
        setProjects([]);
        setError('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
      setError('Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSelectedProject = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await projectAPI.getProjectById(projectId);
      if (response.success && response.data) {
        setSelectedProject(response.data);
      } else {
        setError('Failed to fetch project details');
        navigate('/projects');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Failed to fetch project details');
      navigate('/projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const response = await projectAPI.createProject(newProject);
      if (response.success) {
        setShowCreateModal(false);
        setNewProject({ name: '', description: '' });
        fetchProjects();
      } else {
        setError('Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      setError(null);
      const response = await projectAPI.deleteProject(projectId);
      if (response.success) {
        fetchProjects();
      } else {
        setError('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project');
    }
  };

  // Check system dark mode preference
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);

    const handler = (e) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addEventListener('change', handler);
    return () => darkModeMediaQuery.removeEventListener('change', handler);
  }, []);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProjectClick = (project) => {
    navigate(`/projects/${project._id}`);
  };

  const handleBackToProjects = () => {
    navigate('/projects');
  };
  
  if (selectedProject) {
    return <FileExplorer project={selectedProject} onBack={handleBackToProjects} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
        <div className="flex justify-center items-center h-40 sm:h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-2">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} bg-gray-50 dark:bg-gray-900 transition-colors duration-300`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-16 gap-2 sm:gap-0 py-2 sm:py-0">
            {/* Left section */}
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                <Menu className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Home
              </h1>
            </div>

            {/* Center section - Search */}
            <div className="flex-1 max-w-2xl mx-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors duration-300" />
                </div>
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200" />
                  </button>
                )}
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl flex items-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Project
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Quick actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-8 gap-2 sm:gap-0">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Command className="w-4 h-4" />
            <span>Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">⌘</kbd> + <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">K</kbd> to search</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredProjects.length} projects
            </span>
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-48"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Folder className="w-6 h-6 text-blue-500 mr-2" />
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {project.name}
                      </h2>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project._id);
                      }}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {project.description || 'No description provided'}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProjectClick(project);
                    }}
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Open Project
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredProjects.length === 0 && (
          <div className="text-center py-10 sm:py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg mx-2">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 sm:p-6 rounded-2xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-6">
              <Folder className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {searchTerm ? 'No matching projects' : 'No projects yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms or create a new project.'
                : 'Create your first project to get started with your development journey.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center mx-auto transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Project
              </button>
            )}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Create New Project
            </h2>
            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;