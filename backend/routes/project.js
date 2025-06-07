const express = require('express');
const router = express.Router();
const { verifyAccessToken } = require('../middleware/authMiddleware');
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getFolderByPath,
  createFileOrFolder,
  updateFileOrFolder,
  deleteFileOrFolder,
  getFileContent,
  updateFileContent,
  moveFileOrFolder,
  renameFileOrFolder
} = require('../controllers/projectController');

// Project routes
router.get('/', verifyAccessToken, getAllProjects);
router.post('/', verifyAccessToken, createProject);
router.get('/:projectId', verifyAccessToken, getProjectById);
router.put('/:projectId', verifyAccessToken, updateProject);
router.delete('/:projectId', verifyAccessToken, deleteProject);

// File and folder routes
router.get('/:projectId/folder', verifyAccessToken, getFolderByPath);
router.post('/:projectId/items', verifyAccessToken, createFileOrFolder);
router.put('/:projectId/items/:itemId', verifyAccessToken, updateFileOrFolder);
router.delete('/:projectId/items/:itemId', verifyAccessToken, deleteFileOrFolder);

// File content routes
router.get('/:projectId/files/:fileId/content', verifyAccessToken, getFileContent);
router.put('/:projectId/files/:fileId/content', verifyAccessToken, updateFileContent);

// File/folder operations
router.put('/:projectId/items/:itemId/move', verifyAccessToken, moveFileOrFolder);
router.put('/:projectId/items/:itemId/rename', verifyAccessToken, renameFileOrFolder);

module.exports = router;
