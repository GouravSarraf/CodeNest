const crypto = require('crypto');
const Project = require('../models/Project');
const User = require('../models/User');
const algorithm = 'aes-256-cbc';
const secretKey = process.env.INVITE_SECRET_KEY; // 32 bytes key
const iv = crypto.randomBytes(16);

// Encrypt projectId
function encryptProjectId(projectId) {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey,'hex'), iv);
  let encrypted = cipher.update(projectId);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Decrypt projectId
function decryptProjectId(encryptedData) {
  const [ivHex, encryptedText] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedBuffer = Buffer.from(encryptedText, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey,'hex'), iv);
  let decrypted = decipher.update(encryptedBuffer);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

const generateInvite = async (req, res) => {
  const { projectId } = req.body;
  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: "Project ID is required",
    });
  }
  const encryptedProjectId = encryptProjectId(projectId);
  try {
    const url = `${process.env.FRONTEND_URL}/projects/invite/${encryptedProjectId}`;
    res.status(200).json({
      success: true,
      message: "Invite sent successfully",
      url,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send invite",
      error: error.message,
    });
  }
};

const verifyInvite = async (req, res) => {
    const { inviteId } = req.params;
    
    const decryptedProjectId = decryptProjectId(inviteId);
    const project = await Project.findById(decryptedProjectId);
    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found",
        });
    }
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        if (user.projects.includes(project._id)) {
            return res.status(400).json({
                success: false,
                message: "User already has access to this project",
            });
        }
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            { $push: { projects: project._id } },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(500).json({
                success: false,
                message: "Failed to update user",
            });
        }
        const updatedProject = await Project.findByIdAndUpdate(
            project._id,
            { $push: { collaborators: user._id } },
            { new: true }
        );
        if (!updatedProject) {  
            return res.status(500).json({
                success: false,
                message: "Failed to update project",
            });
        }
        res.status(200).json({
            success: true,
            message: "Invite verified successfully",
            projectId: decryptedProjectId,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to verify invite",
            error: error.message,
        });
    }
};
module.exports = {
    generateInvite,
    verifyInvite,
};