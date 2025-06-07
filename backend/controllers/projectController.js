const Project = require("../models/Project");
const Folder = require("../models/Folder");
const File = require("../models/File");
const User = require("../models/User");
const path = require("path");
const { redis: redisClient, withCache } = require("../utils/redis");

// Helper: Build path for a folder
async function buildFolderPath(name, parentId) {
  if (!parentId) return `/${name}`;
  const parentFolder = await Folder.findById(parentId);
  if (!parentFolder) throw new Error("Parent folder not found");
  return `${parentFolder.path}/${name}`;
}

// Helper function to build path based on parent
const buildPath = async (name, parentId) => {
  if (!parentId) {
    return name;
  }

  // Check if parent is a folder
  const folder = await Folder.findById(parentId);
  if (folder) {
    return `${folder.path}/${name}`;
  }

  // Check if parent is a project
  const project = await Project.findById(parentId);
  if (project) {
    return name;
  }

  throw new Error("Invalid parent ID");
};

// Get all projects for the current user
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.userId })
      .select("-files -folders")
      .sort({ createdAt: -1 });

    if (!projects) {
      return res.status(404).json({
        success: false,
        message: "No projects found for this user",
      });
    }

    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("Error in getAllProjects:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching projects",
      error: error.message,
    });
  }
};

// Create a new project
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    // Create new project
    const project = new Project({
      name,
      description,
      owner: req.user.userId,
    });

    const savedProject = await project.save();

    if (!savedProject) {
      return res.status(500).json({
        success: false,
        message: "Failed to create project",
      });
    }

    // Update user's projects array
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $push: { projects: savedProject._id } },
      { new: true }
    );

    if (!updatedUser) {
      // If user update fails, delete the created project
      await Project.findByIdAndDelete(savedProject._id);
      return res.status(500).json({
        success: false,
        message: "Failed to update user with new project",
      });
    }

    res.status(201).json({
      success: true,
      data: savedProject,
    });
  } catch (error) {
    console.error("Error in createProject:", error);
    res.status(500).json({
      success: false,
      message: "Error creating project",
      error: error.message,
    });
  }
};

// Get a project by ID
const getProjectById = async (req, res) => {
  try {
    if (!req.params.projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    const project = await Project.findOne({
      _id: req.params.projectId,
      owner: req.user.userId,
    })
      .populate("owner", "username email")
      .populate({
        path: "folders",
        populate: {
          path: "files folders",
          populate: {
            path: "files folders",
          },
        },
      })
      .populate("files");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or you do not have access to it",
      });
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Error in getProjectById:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching project",
      error: error.message,
    });
  }
};

// Delete a project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.projectId,
      owner: req.user.userId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or you do not have permission to delete it",
      });
    }

    // Remove project from user's projects array
    await User.findByIdAndUpdate(req.user.userId, {
      $pull: { projects: req.params.projectId },
    });

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteProject:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting project",
      error: error.message,
    });
  }
};

// Update a project
const updateProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    const project = await Project.findOneAndUpdate(
      {
        _id: req.params.projectId,
        owner: req.user.userId,
      },
      { name, description },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or you do not have permission to update it",
      });
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Error in updateProject:", error);
    res.status(500).json({
      success: false,
      message: "Error updating project",
      error: error.message,
    });
  }
};

// Create folder in project
const createFolder = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, parentId } = req.body;

    if (!name || !projectId) {
      return res.status(400).json({ message: "Error creating folder" });
    }

    const project = await Project.findOne({
      _id: projectId,
      owner: req.user.userId,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Build path based on parent
    const path = await buildPath(name, parentId);

    // Create new folder
    const folder = new Folder({
      name,
      path,
      project: projectId,
      parent: parentId || null,
    });

    await folder.save();

    // Update parent
    if (parentId) {
      const parentFolder = await Folder.findById(parentId);
      if (parentFolder) {
        parentFolder.folders.push(folder._id);
        await parentFolder.save();
      }
    } else {
      project.folders.push(folder._id);
      await project.save();
    }

    res.status(201).json(folder);
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ message: "Error creating folder" });
  }
};

// Create file in project
const createFile = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, content, language, parentId } = req.body;

    if (!name) {
      return res.status(400).json({ message: "File name is required" });
    }

    const project = await Project.findOne({
      _id: projectId,
      owner: req.user.userId,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Build path based on parent
    const path = await buildPath(name, parentId);

    // Create new file
    const file = new File({
      name,
      path,
      content: content || "",
      language: language || "plaintext",
      project: projectId,
      parent: parentId || null,
    });

    await file.save();

    // Update parent
    if (parentId) {
      const parentFolder = await Folder.findById(parentId);
      if (parentFolder) {
        parentFolder.files.push(file._id);
        await parentFolder.save();
      }
    } else {
      project.files.push(file._id);
      await project.save();
    }

    res.status(201).json(file);
  } catch (error) {
    console.error("Error creating file:", error);
    res.status(500).json({ message: "Error creating file" });
  }
};

// Get project structure
const getProjectStructure = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      owner: req.user.userId,
    }).select("files folders");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({
      files: project.files,
      folders: project.folders,
    });
  } catch (error) {
    console.error("Error fetching project structure:", error);
    res.status(500).json({ message: "Error fetching project structure" });
  }
};

// File and folder operations
const getFolderByPath = async (req, res) => {
  try {
    const { path: folderPath } = req.query;
    const project = await Project.findOne({
      _id: req.params.projectId,
      owner: req.user.userId,
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or you do not have access to it",
      });
    }

    // Find folder by path
    
    let folder = await findFolderByPath(project, folderPath || "/");
    
    if (!folder) {
      folder = project;
    }
    
    // Populate nested folders recursively
    const populateFiles = async (files) => {
      if (!files || files.length === 0) return files;



      const populatedFiles = await Promise.all(
        files.map(async (file) => {
          const populatedFile = await File.findById(file._id);
          return populatedFile || file;
        })
      );
      files = populatedFiles;
      return files;

    };
    const populateFolders = async (folder) => {
      if (!folder.folders || folder.folders.length === 0) return folder;
     

      const populatedFolders = await Promise.all(
        folder.folders.map(async (subfolder) => {
          const populatedFolder = await Folder.findById(subfolder._id);
          if (populatedFolder) {
            return populateFolders(populatedFolder);
          }
          return subfolder;
        })
      );
      folder.folders = populatedFolders;
      return folder;
    };
    folder.files = await populateFiles(folder.files);
    folder = await populateFolders(folder);

    
    res.json({
      success: true,
      data: folder,
    });
  } catch (error) {
    console.error("Error in getFolderByPath:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching folder",
      error: error.message,
    });
  }
};

const createFileOrFolder = async (req, res) => {
  try {
    const { name, type, content, path: itemPath } = req.body;
    const project = await Project.findOne({
      _id: req.params.projectId,
      owner: req.user.userId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or you do not have access to it"
      });
    }

    let parentFolder = await findFolderByPath(project, itemPath || "\\");
    
    if (!parentFolder) {
      parentFolder = project;
    }

    if (type === "folder") {
      // Create a new Folder document
      const newFolder = new Folder({
        name,
        path: path.join(itemPath || "/", name),
        files: [],
        folders: [],
        project: project._id,
        parent: parentFolder._id
      });

      // Save the folder
      const savedFolder = await newFolder.save();
      
      // Add the folder's ID to the parent folder's folders array
      parentFolder.folders.push(savedFolder._id);
      await parentFolder.save();
      await project.save();

      res.status(201).json({
        success: true,
        data: savedFolder
      });
    } else {
      // Create a new File document
      const newFile = new File({
        name,
        content: content || "",
        language: "plaintext",
        path: path.join(itemPath || "/", name),
        project: project._id,
        parent: parentFolder._id
      });

      // Save the file
      const savedFile = await newFile.save();
      
      // Add the file's ID to the parent folder's files array
      parentFolder.files.push(savedFile._id);
      await parentFolder.save();
      await project.save();

      res.status(201).json({
        success: true,
        data: savedFile
      });
    }
  } catch (error) {
    console.error("Error in createFileOrFolder:", error);
    res.status(500).json({
      success: false,
      message: "Error creating item",
      error: error.message
    });
  }
};

const updateFileOrFolder = async (req, res) => {
  try {
    const { name, content } = req.body;
    const project = await Project.findOne({
      _id: req.params.projectId,
      owner: req.user.userId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or you do not have access to it",
      });
    }

    // Find and update item
    const item = findItemById(project, req.params.itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    if (name) item.name = name;
    if (content !== undefined && "content" in item) item.content = content;

    await project.save();

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Error in updateFileOrFolder:", error);
    res.status(500).json({
      success: false,
      message: "Error updating item",
      error: error.message,
    });
  }
};

const deleteFileOrFolder = async (req, res) => {
  try {
    const { type } = req.query;
    const project = await Project.findOne({
      _id: req.params.projectId,
      owner: req.user.userId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or you do not have access to it",
      });
    }

    // Find and delete item
    const { parentFolder, item } = await findItemAndParent(
      project,
      req.params.itemId,
      type
    );
    
    
    if (!item || !parentFolder) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }
    console.log(parentFolder);
    console.log(item);
    console.log(type);
    if (type === "folder") {
      parentFolder.folders = parentFolder.folders.filter(
        (f) => f._id.toString() !== req.params.itemId
      );
    } else {
      parentFolder.files = parentFolder.files.filter(
        (f) => f._id.toString() !== req.params.itemId
      );
    }

    await parentFolder.save();

    res.json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteFileOrFolder:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting item",
      error: error.message,
    });
  }
};

// Get file content
const getFileContent = async (req, res) => {
  try {
    const { projectId, fileId } = req.params;

    const project = await Project.findOne({
      _id: projectId,
      owner: req.user.userId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or you do not have access to it",
      });
    }

    // Use Redis cache with fileId as the key
    const fileContent = await withCache(`file:${fileId}`, async () => {
      
      const file = await findFileById(project, fileId);
      
      if (!file) {
        throw new Error("File not found");
      }

      return {
        content: file.content,
        name: file.name,
        type: file.type,
        path: file.path,
        lastModified: file.updatedAt
      };
    });
    
    res.json({
      success: true,
      data: fileContent,
    });
  } catch (error) {
    console.error("Error in getFileContent:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching file content",
      error: error.message,
    });
  }
};

// Update file content
const updateFileContent = async (req, res) => {
  try {
    const { projectId, fileId } = req.params;
    const { content } = req.body;

    const project = await Project.findOne({
      _id: projectId,
      owner: req.user.userId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or you do not have access to it",
      });
    }

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Update file content
    file.content = content;
    file.updatedAt = new Date();
    await file.save();
    const fileData = {
      content: file.content,
      name: file.name,
      type: file.type,
      path: file.path,
      lastModified: file.updatedAt
    };
    // Invalidate Redis cache for this file by setting it to null with 1 second expiry
    await redisClient.del(`file:${fileId}`);
    await redisClient.set(`file:${fileId}`, JSON.stringify(fileData), { ex: 3600 });

    res.json({
      success: true,
      data: fileData
    });
  } catch (error) {
    console.error("Error in updateFileContent:", error);
    res.status(500).json({
      success: false,
      message: "Error updating file content",
      error: error.message,
    });
  }
};

const moveFileOrFolder = async (req, res) => {
  try {
    const { newPath } = req.body;
    const project = await Project.findOne({
      _id: req.params.projectId,
      owner: req.user.userId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or you do not have access to it",
      });
    }

    const { parentFolder, item } = findItemAndParent(
      project,
      req.params.itemId
    );
    if (!item || !parentFolder) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    const targetFolder = findFolderByPath(project.folders, newPath);
    if (!targetFolder) {
      return res.status(404).json({
        success: false,
        message: "Target folder not found",
      });
    }

    // Remove from old location
    if ("content" in item) {
      parentFolder.files = parentFolder.files.filter(
        (f) => f._id.toString() !== req.params.itemId
      );
      targetFolder.files.push(item);
    } else {
      parentFolder.folders = parentFolder.folders.filter(
        (f) => f._id.toString() !== req.params.itemId
      );
      targetFolder.folders.push(item);
    }

    // Update path
    item.path = path.join(newPath, item.name);

    await project.save();

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Error in moveFileOrFolder:", error);
    res.status(500).json({
      success: false,
      message: "Error moving item",
      error: error.message,
    });
  }
};

const renameFileOrFolder = async (req, res) => {
  try {
    const { newName } = req.body;
    const project = await Project.findOne({
      _id: req.params.projectId,
      owner: req.user.userId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or you do not have access to it",
      });
    }

    const { parentFolder, item } = findItemAndParent(
      project,
      req.params.itemId
    );
    if (!item || !parentFolder) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    const oldPath = item.path;
    item.name = newName;
    item.path = path.join(path.dirname(oldPath), newName);

    await project.save();

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Error in renameFileOrFolder:", error);
    res.status(500).json({
      success: false,
      message: "Error renaming item",
      error: error.message,
    });
  }
};

// Helper functions
async function findFolderByPath(project, targetPath) {
  
  let output = await Folder.findOne({ project: project._id, path: targetPath });
  if (output) return output;
  else if(targetPath === "\\") return project;
  else return null;
}

async function findItemById(project, itemId) {
  let item = await File.findById(itemId);
  if (item) return item;
  item = await Folder.findById(itemId);
  if (item) return item;
  return null;
}

function findFileById(project, fileId) {
    return File.findById(fileId);
}

async function findItemAndParent(project, itemId) {
  const item = await findItemById(project, itemId);
  let parentPath = item.path.split("\\").slice(0, -1).join("\\");
  if(parentPath.length===0)parentPath = "\\";
  
  const parentFolder = await findFolderByPath(project, parentPath);
  return { parentFolder, item };
}

module.exports = {
  getAllProjects,
  createProject,
  getProjectById,
  deleteProject,
  updateProject,
  createFolder,
  createFile,
  getProjectStructure,
  getFolderByPath,
  createFileOrFolder,
  updateFileOrFolder,
  deleteFileOrFolder,
  getFileContent,
  updateFileContent,
  moveFileOrFolder,
  renameFileOrFolder,
};
