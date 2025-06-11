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
  ArrowLeft,
  Link
} from 'lucide-react';
import FileExplorer from './FileExplorer';
import { projectAPI } from '../api/api';
import { generateInvite } from '../api/invite';
import { authAPI } from '../api/auth';


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
  const [inviteLink, setInviteLink] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

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

  const handleGenerateInvite = async (projectId, e) => {
    e.stopPropagation();
    try {
      const response = await generateInvite(projectId);
      if (response.success) {
        const inviteUrl = response.url;
        setInviteLink(inviteUrl);
        await navigator.clipboard.writeText(inviteUrl);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (error) {
      console.error('Error generating invite:', error);
      setError('Failed to generate invite link');
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

  // Logout handler
  const handleLogout = async () => {
    try {
      await authAPI.logout();
      navigate('/login');
    } catch (error) {
      // Optionally handle error
      navigate('/login');
    }
  };

  if (selectedProject) {
    return <FileExplorer project={selectedProject} onBack={handleBackToProjects} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFFCA]/5 dark:bg-[#5A827E]/5 p-4 sm:p-8">
        <div className="flex justify-center items-center h-40 sm:h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5A827E]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFFCA]/5 dark:bg-[#5A827E]/5 p-2">
        <div className="text-[#5A827E] dark:text-[#B9D4AA]">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: '#222831' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b backdrop-blur-lg" style={{ background: '#222831', borderColor: '#393E46' }}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          {copySuccess && (
            <div className="w-full py-2 mb-2 rounded-lg text-sm text-center" style={{ background: '#00ADB5', color: '#222831' }}>
              Invite link copied to clipboard!
            </div>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-16 gap-2 sm:gap-0 py-2 sm:py-0">
            {/* Left section */}
            

            {/* Center section - Search */}
            <div className="flex-1 max-w-2xl mx-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5" style={{ color: '#00ADB5' }} />
                </div>
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 placeholder-[#EEEEEE]"
                  style={{ background: '#393E46', borderColor: '#393E46', color: '#EEEEEE' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="w-4 h-4" style={{ color: '#00ADB5' }} />
                  </button>
                )}
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-2">
              
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-xl flex items-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer"
                style={{ background: '#00ADB5', color: '#222831' }}
              >
                <Plus className="w-5 h-5 mr-2" />
                New Project
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl flex items-center transition-all duration-300 ml-2 hover:shadow-xl hover:scale-105 cursor-pointer"
                style={{ background: '#00ADB5', color: '#222831' }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Quick actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-8 gap-2 sm:gap-0">
          
          <div className="flex items-center space-x-4">
            <span className="text-sm" style={{ color: '#00ADB5' }}>
              {filteredProjects.length} projects
            </span>
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="rounded-2xl h-48" style={{ background: '#393E46' }}></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border"
                style={{ background: '#393E46', borderColor: '#00ADB5' }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Folder className="w-6 h-6 mr-2" style={{ color: '#00ADB5' }} />
                      <h2 className="text-xl font-semibold" style={{ color: '#EEEEEE' }}>
                        {project.name}
                      </h2>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => handleGenerateInvite(project._id, e)}
                        className="transition-colors"
                        title="Generate invite link"
                        style={{ color: '#00ADB5' }}
                      >
                        <Link className="w-5 h-5 cursor-pointer" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project._id);
                        }}
                        className="transition-colors"
                        style={{ color: '#00ADB5' }}
                      >
                        <Trash2 className="w-5 h-5 cursor-pointer" />
                      </button>
                    </div>
                  </div>
                  <p className="mb-4" style={{ color: '#00ADB5' }}>
                    {project.description || 'No description provided'}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProjectClick(project);
                    }}
                    className="w-full px-4 py-2 rounded-lg transition-colors cursor-pointer"
                    style={{ background: '#222831', color: '#EEEEEE' }}
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
          <div className="text-center py-10 sm:py-20 rounded-2xl border shadow-lg mx-2" style={{ background: '#393E46', borderColor: '#00ADB5' }}>
            <div className="p-4 sm:p-6 rounded-2xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-6" style={{ background: '#222831' }}>
              <Folder className="w-10 h-10" style={{ color: '#00ADB5' }} />
            </div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: '#EEEEEE' }}>
              {searchTerm ? 'No matching projects' : 'No projects yet'}
            </h3>
            <p className="max-w-sm mx-auto mb-6" style={{ color: '#00ADB5' }}>
              {searchTerm 
                ? 'Try adjusting your search terms or create a new project.'
                : 'Create your first project to get started with your development journey.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 rounded-xl flex items-center mx-auto transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer"
                style={{ background: '#00ADB5', color: '#222831' }}
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
        <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="absolute inset-0 bg-[#222831]/60 backdrop-blur-sm"></div>
          <div className="rounded-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-md border z-10" style={{ background: '#393E46', borderColor: '#00ADB5' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#EEEEEE' }}>
              Create New Project
            </h2>
            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label className="block mb-2" style={{ color: '#00ADB5' }}>
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                  style={{ background: '#222831', color: '#EEEEEE', borderColor: '#393E46' }}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2" style={{ color: '#00ADB5' }}>
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                  style={{ background: '#222831', color: '#EEEEEE', borderColor: '#393E46' }}
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2"
                  style={{ color: '#00ADB5' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  style={{ background: '#00ADB5', color: '#222831' }}
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