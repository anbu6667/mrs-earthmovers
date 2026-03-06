const path = require('path');
const fs = require('fs');
const PhotoProof = require('../models/PhotoProof');
const WorkRequest = require('../models/WorkRequest');
const WorkAssignment = require('../models/WorkAssignment');

const ensureUploadsDir = () => {
  const dir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
};

class PhotoProofController {
  async create(req, res) {
    try {
      ensureUploadsDir();

      const {
        workAssignment,
        workRequest,
        type,
        title,
        description,
        latitude,
        longitude,
        accuracy,
        address,
      } = req.body;

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Image file is required' });
      }

      if (!workAssignment || !workRequest || !type || !title) {
        return res.status(400).json({
          success: false,
          message: 'workAssignment, workRequest, type, and title are required',
        });
      }

      const assignment = await WorkAssignment.findById(workAssignment);
      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Work assignment not found',
          details: { workAssignment },
        });
      }

      // Only the assigned driver (or admin) can upload proofs
      if (req.user.role !== 'ADMIN' && String(assignment.driver) !== String(req.user.id)) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      const work = await WorkRequest.findById(workRequest);
      if (!work) {
        return res.status(404).json({
          success: false,
          message: 'Work request not found',
          details: { workRequest },
        });
      }

      const imageUrl = `/uploads/${req.file.filename}`;

      const photoProof = await PhotoProof.create({
        workAssignment,
        workRequest,
        type,
        title,
        description: description || '',
        imageUrl,
        geolocation: {
          latitude: Number(latitude) || 0,
          longitude: Number(longitude) || 0,
          accuracy: accuracy ? Number(accuracy) : undefined,
        },
        uploadedBy: req.user.id,
        notes: address || '',
        fileSize: req.file.size,
      });

      work.photos = work.photos || [];
      work.photos.push(photoProof._id);
      work.updatedAt = new Date();
      await work.save();

      return res.status(201).json({
        success: true,
        message: 'Photo proof uploaded successfully',
        data: photoProof,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new PhotoProofController();
