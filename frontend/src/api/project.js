import axiosInstance from './axiosInstance';

// Project operations
export const getAllProjects = async () => {
  try {
    const response = await axiosInstance.get('/projects');
    return response.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

export const getProjectById = async (projectId) => {
  try {
    const response = await axiosInstance.get(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
};

export const createProject = async (projectData) => {
  try {
    const response = await axiosInstance.post('/projects', projectData);
    return response.data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const updateProject = async (projectId, projectData) => {
  try {
    const response = await axiosInstance.put(`/projects/${projectId}`, projectData);
    return response.data;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

export const deleteProject = async (projectId) => {
  try {
    const response = await axiosInstance.delete(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

// File and Folder operations
export const getFolderByPath = async (projectId, path) => {
  try {
    const response = await axiosInstance.get(`/projects/${projectId}/folder`, {
      params: { path }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching folder:', error);
    throw error;
  }
};

export const createFileOrFolder = async (projectId, itemData) => {
  try {
    const response = await axiosInstance.post(`/projects/${projectId}/items`, itemData);
    return response.data;
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
};

export const updateFileOrFolder = async (projectId, itemId, itemData) => {
  try {
    const response = await axiosInstance.put(`/projects/${projectId}/items/${itemId}`, itemData);
    return response.data;
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
};

export const deleteFileOrFolder = async (projectId, itemId, type) => {
  try {
    const response = await axiosInstance.delete(`/projects/${projectId}/items/${itemId}`, {
      params: { type }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

export const getFileContent = async (projectId, fileId) => {
  try {
    const response = await axiosInstance.get(`/projects/${projectId}/files/${fileId}/content`);
    return response.data;
  } catch (error) {
    console.error('Error fetching file content:', error);
    throw error;
  }
};

export const updateFileContent = async (projectId, fileId, content) => {
  try {
    const response = await axiosInstance.put(`/projects/${projectId}/files/${fileId}/content`, {
      content
    });
    return response.data;
  } catch (error) {
    console.error('Error updating file content:', error);
    throw error;
  }
};

export const moveFileOrFolder = async (projectId, itemId, newPath) => {
  try {
    const response = await axiosInstance.put(`/projects/${projectId}/items/${itemId}/move`, {
      newPath
    });
    return response.data;
  } catch (error) {
    console.error('Error moving item:', error);
    throw error;
  }
};

export const renameFileOrFolder = async (projectId, itemId, newName) => {
  try {
    const response = await axiosInstance.put(`/projects/${projectId}/items/${itemId}/rename`, {
      newName
    });
    return response.data;
  } catch (error) {
    console.error('Error renaming item:', error);
    throw error;
  }
};
