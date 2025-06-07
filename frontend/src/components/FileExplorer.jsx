import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  File,
  FileText,
  FileCode,
  ArrowLeft,
  Plus,
  Trash2,
  MoreVertical,
  X,
  Check,
  FolderPlus,
  FilePlus,
  FolderIcon,
} from "lucide-react";
import { projectAPI } from "../api/api";

const FileIcon = ({ language, name }) => {
  const extension = name.split(".").pop()?.toLowerCase();

  if (language === "javascript" || extension === "js" || extension === "jsx") {
    return <FileCode className="w-4 h-4 text-yellow-500" />;
  }
  if (language === "html" || extension === "html") {
    return <FileCode className="w-4 h-4 text-orange-500" />;
  }
  if (language === "css" || extension === "css") {
    return <FileCode className="w-4 h-4 text-blue-500" />;
  }
  if (language === "json" || extension === "json") {
    return <FileCode className="w-4 h-4 text-green-500" />;
  }
  if (language === "markdown" || extension === "md") {
    return <FileText className="w-4 h-4 text-gray-600" />;
  }
  if (language === "python" || extension === "py") {
    return <FileCode className="w-4 h-4 text-blue-600" />;
  }
  return <File className="w-4 h-4 text-gray-500" />;
};

const FileItem = ({ file, onFileClick, depth = 0, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className="group relative flex items-center py-2.5 px-4 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 cursor-pointer transition-all duration-200"
      style={{ paddingLeft: `${depth * 20 + 16}px` }}
      onClick={() => onFileClick(file)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 via-transparent to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-center justify-between w-full">
        <div className="flex items-center">
          <div className="bg-white dark:bg-gray-800 p-1.5 rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors duration-200 shadow-sm group-hover:shadow-md">
            <FileIcon language={file.language} name={file.name} />
          </div>
          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
            {file.name}
          </span>
        </div>

        {/* Action buttons */}
        <div
          className={`flex items-center space-x-2 ${
            showActions ? "opacity-100" : "opacity-0"
          } transition-opacity duration-200`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(file);
            }}
            className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

const FolderItem = ({
  folder,
  onFileClick,
  depth = 0,
  onDelete,
  onCreateFile,
  onCreateFolder,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [createType, setCreateType] = useState(null); // 'file' or 'folder'

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCreate = async (e) => {
    e.stopPropagation();
    if (!newName.trim()) return;

    try {
      if (createType === "file") {
        await onCreateFile(folder._id, newName);
      } else {
        await onCreateFolder(folder._id, newName);
      }
      setNewName("");
      setCreateType(null);
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating:", error);
    }
  };

  return (
    <div>
      <div
        className="group relative flex items-center py-2.5 px-4 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 cursor-pointer transition-all duration-200"
        style={{ paddingLeft: `${depth * 20 + 16}px` }}
        onClick={toggleExpanded}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 via-transparent to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative flex items-center justify-between w-full">
          <div className="flex items-center">
            <div className="flex items-center">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-200" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-200" />
              )}
              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-1.5 rounded-lg ml-1 group-hover:scale-110 transition-transform duration-200 shadow-sm group-hover:shadow-md">
                <Folder className="w-4 h-4 text-white" />
              </div>
            </div>
            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
              {folder.name}
            </span>
          </div>

          {/* Action buttons */}
          <div
            className={`flex items-center space-x-2 ${
              showActions ? "opacity-100" : "opacity-0"
            } transition-opacity duration-200`}
          >
            {!isCreating ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCreateType("file");
                    setIsCreating(true);
                  }}
                  className="p-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors duration-200"
                >
                  <FilePlus className="w-4 h-4 text-indigo-500" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCreateType("folder");
                    setIsCreating(true);
                  }}
                  className="p-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors duration-200"
                >
                  <FolderPlus className="w-4 h-4 text-indigo-500" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(folder);
                  }}
                  className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </>
            ) : (
              <div
                className="flex items-center space-x-2"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={`New ${createType} name...`}
                  className="px-2 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <button
                  onClick={handleCreate}
                  className="p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200"
                >
                  <Check className="w-4 h-4 text-green-500" />
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewName("");
                    setCreateType(null);
                  }}
                  className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="animate-in slide-in-from-top-1 duration-200">
          {folder.files?.map((file) => (
            <FileItem
              key={file._id}
              file={file}
              onFileClick={onFileClick}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}

          {folder.folders?.map((subfolder) => (
            <FolderItem
              key={subfolder._id}
              folder={subfolder}
              onFileClick={onFileClick}
              onDelete={onDelete}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function FileExplorer({ onFileSelect }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [currentPath, setCurrentPath] = useState(() => {
    const saved = projectId && localStorage.getItem(`currentPath_${projectId}`);
    return saved || "\\";
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    type: "file",
    content: "",
  });
  const [currentFolder, setCurrentFolder] = useState(null);

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  useEffect(() => {
    if (project) {
      fetchCurrentFolder();
    }
  }, [project, currentPath]);

  useEffect(() => {
    if (projectId && currentPath) {
      localStorage.setItem(`currentPath_${projectId}`, currentPath);
    }
  }, [projectId, currentPath]);

  const fetchProject = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await projectAPI.getProjectById(projectId);
      if (response.success && response.data) {
        setProject(response.data);
      } else {
        setError("Failed to fetch project");
        navigate("/projects");
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      setError("Failed to fetch project");
      navigate("/projects");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentFolder = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await projectAPI.getFolderByPath(
        project._id,
        currentPath
      );
      if (response.success && response.data) {
        setCurrentFolder(response.data);
      } else {
        setError("Failed to fetch folder contents");
      }
    } catch (error) {
      console.error("Error fetching folder:", error);
      setError("Failed to fetch folder contents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const response = await projectAPI.createFileOrFolder(project._id, {
        ...newItem,
        path: currentPath,
      });
      if (response.success) {
        setShowCreateModal(false);
        setNewItem({ name: "", type: "file", content: "" });
        fetchCurrentFolder();
      } else {
        setError("Failed to create item");
      }
    } catch (error) {
      console.error("Error creating item:", error);
      setError("Failed to create item");
    }
  };

  const handleDeleteItem = async (itemId, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }

    try {
      setError(null);
      const response = await projectAPI.deleteFileOrFolder(
        project._id,
        itemId,
        type
      );
      if (response.success) {
        fetchCurrentFolder();
      } else {
        setError(`Failed to delete ${type}`);
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      setError(`Failed to delete ${type}`);
    }
  };

  const handleFolderClick = (folder) => {
    setCurrentPath(folder.path);
  };

  const handleFileClick = (file) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleBackToProjects = () => {
    navigate("/projects");
  };

  const handleBack = () => {
    if (currentPath === "\\") {
      onFileSelect(null);
      handleBackToProjects();
      return;
    }

    // Remove the last segment of the path
    const newPath = currentPath.split("\\").slice(0, -1).join("\\") || "\\";
    setCurrentPath(newPath);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-8 gap-4 sm:gap-0">
          <div className="flex-1">
            <button
              onClick={handleBack}
              className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex-1 text-center">
            {project.name}
          </h1>
          <div className="flex-1 flex justify-end">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Item
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 sm:p-4 md:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Current Path: {currentPath}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
            {currentFolder?.folders?.map((folder) => (
              <div
                key={folder._id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                onClick={() => handleFolderClick(folder)}
              >
                <div className="flex items-center">
                  <Folder className="w-6 h-6 text-blue-500 mr-3" />
                  <span className="text-gray-900 dark:text-white">
                    {folder.name}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteItem(folder._id, "folder");
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}

            {currentFolder?.files?.map((file) => (
              <div
                key={file._id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                onClick={() => handleFileClick(file)}
              >
                <div className="flex items-center">
                  <File className="w-6 h-6 text-green-500 mr-3" />
                  <span className="text-gray-900 dark:text-white">
                    {file.name}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteItem(file._id, "file");
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 px-2">
            <div className="absolute inset-0 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 relative">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Create New Item
              </h2>
              <form onSubmit={handleCreateItem}>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem({ ...newItem, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={newItem.type}
                    onChange={(e) =>
                      setNewItem({ ...newItem, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="file">File</option>
                    <option value="folder">Folder</option>
                  </select>
                </div>
                {newItem.type === "file" && (
                  <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Content
                    </label>
                    <textarea
                      value={newItem.content}
                      onChange={(e) =>
                        setNewItem({ ...newItem, content: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows="4"
                    />
                  </div>
                )}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileExplorer;
