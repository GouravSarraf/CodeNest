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
    return <FileCode className="w-4 h-4 text-[#B8CFCE]" />;
  }
  if (language === "cpp" || extension === "cpp") {
    return <FileCode className="w-4 h-4 text-[#B8CFCE]" />;
  }
  if (language === "html" || extension === "html") {
    return <FileCode className="w-4 h-4 text-[#B8CFCE]" />;
  }
  if (language === "css" || extension === "css") {
    return <FileCode className="w-4 h-4 text-[#B8CFCE]" />;
  }
  if (language === "json" || extension === "json") {
    return <FileCode className="w-4 h-4 text-[#B8CFCE]" />;
  }
  if (language === "markdown" || extension === "md") {
    return <FileText className="w-4 h-4 text-[#B8CFCE]" />;
  }
  if (language === "python" || extension === "py") {
    return <FileCode className="w-4 h-4 text-[#B8CFCE]" />;
  }
  return <File className="w-4 h-4 text-[#B8CFCE]" />;
};

const FileItem = ({ file, onFileClick, depth = 0, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  
  return (
    <div
      className="group relative flex items-center py-1 px-2 hover:bg-[#393E46] cursor-pointer transition-all duration-200"
      style={{ paddingLeft: `${depth * 12 + 8}px`, background: '#222831' }}
      onClick={() => onFileClick(file)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="relative flex items-center justify-between w-full">
        <div className="flex items-center">
          <div className="p-1">
            <FileIcon language={file.language} name={file.name} />
          </div>
          <span className="ml-1 text-sm text-[#EEEEEE] group-hover:text-[#00ADB5] transition-colors duration-200">
            {file.name}
          </span>
        </div>
        <div
          className={`flex items-center space-x-1 ${
            showActions ? "opacity-100" : "opacity-0"
          } transition-opacity duration-200`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(file);
            }}
            className="p-1 hover:bg-[#393E46] rounded transition-colors duration-200"
          >
            <Trash2 className="w-3 h-3 text-[#00ADB5]" />
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
  const [createType, setCreateType] = useState(null);
  const [files, setFiles] = useState([]);
  const [subfolders, setSubfolders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFolderContents = async () => {
    if (!isExpanded) return;

    setIsLoading(true);
    try {
      // Fetch files
      const filePromises = folder.files.map((fileId) =>
        projectAPI.getFileById(folder.project, fileId)
      );
      const fileResults = await Promise.all(filePromises);
      setFiles(
        fileResults
          .filter((result) => result.success)
          .map((result) => result.data)
      );

      // Fetch subfolders
      const folderPromises = folder.folders.map((folderId) =>
        projectAPI.getFolderById(folder.project, folderId)
      );
      const folderResults = await Promise.all(folderPromises);
      setSubfolders(
        folderResults
          .filter((result) => result.success)
          .map((result) => result.data)
      );
    } catch (error) {
      console.error("Error fetching folder contents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      fetchFolderContents();
    }
  }, [isExpanded, folder.files, folder.folders]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCreate = async (e) => {
    e.stopPropagation();
    if (!newName.trim()) return;

    try {
      if (createType === "file") {
        await onCreateFile({ name: newName, type: "file", path: folder.path });
      } else {
        await onCreateFolder({
          name: newName,
          type: "folder",
          path: folder.path,
        });
      }
      setNewName("");
      setCreateType(null);
      setIsCreating(false);
      // Refresh folder contents after creating new item
      fetchFolderContents();
    } catch (error) {
      console.error("Error creating:", error);
    }
  };

  return (
    <div>
      <div
        className="group relative flex items-center py-1 px-2 hover:bg-[#393E46] cursor-pointer transition-all duration-200"
        style={{ paddingLeft: `${depth * 12 + 8}px`, background: '#222831' }}
        onClick={toggleExpanded}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="relative flex items-center justify-between w-full">
          <div className="flex items-center">
            <div className="flex items-center">
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-[#00ADB5] group-hover:text-[#EEEEEE] transition-colors duration-200" />
              ) : (
                <ChevronRight className="w-3 h-3 text-[#00ADB5] group-hover:text-[#EEEEEE] transition-colors duration-200" />
              )}
              <div className="p-1">
                <Folder className="w-4 h-4 text-[#00ADB5]" />
              </div>
            </div>
            <span className="ml-1 text-sm font-medium text-[#EEEEEE] group-hover:text-[#00ADB5] transition-colors duration-200">
              {folder.name}
            </span>
          </div>
          <div
            className={`flex items-center space-x-1 ${
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
                  className="p-1 hover:bg-[#393E46] rounded transition-colors duration-200"
                >
                  <FilePlus className="w-3 h-3 text-[#00ADB5]" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCreateType("folder");
                    setIsCreating(true);
                  }}
                  className="p-1 hover:bg-[#393E46] rounded transition-colors duration-200"
                >
                  <FolderPlus className="w-3 h-3 text-[#00ADB5]" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(folder);
                  }}
                  className="p-1 hover:bg-[#393E46] rounded transition-colors duration-200"
                >
                  <Trash2 className="w-3 h-3 text-[#00ADB5]" />
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="animate-in slide-in-from-top-1 duration-200">
          {isCreating && (
            <div
              className="flex items-center space-x-1 bg-[#393E46] rounded-lg border border-[#222831] shadow-sm my-1 ml-6"
              style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center px-2">
                {createType === "file" ? (
                  <FilePlus className="w-3 h-3 text-[#00ADB5] mr-1" />
                ) : (
                  <FolderPlus className="w-3 h-3 text-[#00ADB5] mr-1" />
                )}
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={`New ${createType} name...`}
                  className="w-32 px-1 py-0.5 text-xs bg-transparent border-none focus:outline-none text-[#EEEEEE]"
                  autoFocus
                  style={{ background: 'transparent' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newName.trim()) {
                      handleCreate(e);
                    } else if (e.key === 'Escape') {
                      setIsCreating(false);
                      setNewName("");
                      setCreateType(null);
                    }
                  }}
                />
              </div>
              <div className="flex items-center border-l border-[#222831]">
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  className="p-1 hover:bg-[#222831] rounded-l-none transition-colors duration-200 disabled:opacity-50"
                >
                  <Check className="w-3 h-3 text-[#00ADB5]" />
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewName("");
                    setCreateType(null);
                  }}
                  className="p-1 hover:bg-[#222831] rounded-l-none transition-colors duration-200"
                >
                  <X className="w-3 h-3 text-[#00ADB5]" />
                </button>
              </div>
            </div>
          )}
          {isLoading ? (
            <div className="py-2 px-4">
              <div className="animate-pulse flex space-x-2">
                <div className="h-4 w-4 bg-[#393E46] rounded"></div>
                <div className="h-4 w-24 bg-[#393E46] rounded"></div>
              </div>
            </div>
          ) : (
            <>
              {files.map((file) => (
                <FileItem
                  key={file._id}
                  file={file}
                  onFileClick={onFileClick}
                  onDelete={onDelete}
                  depth={depth + 1}
                />
              ))}
              {subfolders.map((subfolder) => (
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
            </>
          )}
        </div>
      )}
    </div>
  );
};

function FileExplorer({ onFileSelect, onBack }) {
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
    path: "",
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

  const handleCreateItem = async ({ name, type, path }) => {
    try {
      setError(null);

      const response = await projectAPI.createFileOrFolder(project._id, {
        name: name,
        type: type,
        path: path,
      });
      if (response.success) {
        setShowCreateModal(false);
        setNewItem({ name: "", type: "file", content: "", path: "" });
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
    onFileSelect(null);
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
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7F8CAA]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-[#7F8CAA]">{error}</div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="h-full flex flex-col" style={{ background: '#222831' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: '#393E46', background: '#222831' }}>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleBack}
            className="p-1 hover:bg-[#393E46] rounded transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#00ADB5]" />
          </button>
          <h2 className="text-sm font-medium text-[#EEEEEE] truncate">
            {project.name}
          </h2>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="p-1 hover:bg-[#393E46] rounded transition-colors"
        >
          <Plus className="w-4 h-4 text-[#00ADB5]" />
        </button>
      </div>
      {/* File Tree */}
      <div className="flex-1 overflow-y-auto py-2" style={{ background: '#222831' }}>
        {currentFolder?.folders?.map((folder) => (
          <FolderItem
            key={folder._id}
            folder={folder}
            onFileClick={(file) => {
              onFileSelect(file);
              if (onBack) onBack();
            }}
            onDelete={(folder) => handleDeleteItem(folder._id, "folder")}
            onCreateFile={handleCreateItem}
            onCreateFolder={handleCreateItem}
            depth={0}
          />
        ))}
        {currentFolder?.files?.map((file) => (
          <FileItem
            key={file._id}
            file={file}
            onFileClick={(file) => {
              onFileSelect(file);
              if (onBack) onBack();
            }}
            onDelete={(file) => handleDeleteItem(file._id, "file")}
            depth={0}
          />
        ))}
      </div>
      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-2">
          <div className="absolute inset-0 backdrop-blur-sm" style={{ background: '#222831cc' }}></div>
          <div className="rounded-lg p-4 w-full max-w-xs shadow-2xl border relative" style={{ background: '#393E46', borderColor: '#00ADB5' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium text-[#EEEEEE]">
                Create New
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-[#222831] rounded transition-colors"
              >
                <X className="w-4 h-4 text-[#00ADB5]" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateItem({
                  name: newItem.name,
                  type: newItem.type,
                  path: currentPath,
                });
              }}
              className="space-y-3"
            >
              <div>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Enter name..."
                  className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-1"
                  style={{ background: '#222831', color: '#EEEEEE', borderColor: '#393E46' }}
                  required
                  autoFocus
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setNewItem({ ...newItem, type: "file" })}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                    newItem.type === "file"
                      ? "bg-[#00ADB5] text-[#222831]"
                      : "bg-[#393E46] text-[#EEEEEE]"
                  }`}
                >
                  File
                </button>
                <button
                  type="button"
                  onClick={() => setNewItem({ ...newItem, type: "folder" })}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                    newItem.type === "folder"
                      ? "bg-[#00ADB5] text-[#222831]"
                      : "bg-[#393E46] text-[#EEEEEE]"
                  }`}
                >
                  Folder
                </button>
              </div>
              <button
                type="submit"
                className="w-full px-3 py-2 rounded-lg transition-colors"
                style={{ background: '#00ADB5', color: '#222831' }}
              >
                Create
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileExplorer;
