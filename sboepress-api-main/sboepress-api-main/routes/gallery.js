const express = require('express');
const router = express.Router();
const Media = require('../models/MediaGallery.js');
const { verifyToken, isAdmin } = require('../middleware/auth.js');

// Get all gallery images
router.get('/', async (req, res) => {
  try {
    const images = await Media.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: images });
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    res.status(500).json({ success: false, message: 'Error fetching gallery images' });
  }
});

// Add new image to gallery (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { imageUrl, category } = req.body;

    if (!imageUrl || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Image URL and category are required' 
      });
    }

    const newImage = await Media.create({
      imageUrl,
      category,
      createdAt: new Date()
    });

    res.status(201).json({ 
      success: true, 
      message: 'Image added successfully', 
      data: newImage 
    });
  } catch (error) {
    console.error('Error adding image to gallery:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error adding image to gallery' 
    });
  }
});

// Delete image from gallery (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const image = await Media.findByIdAndDelete(req.params.id);
    if (!image) {
      return res.status(404).json({ 
        success: false, 
        message: 'Image not found' 
      });
    }
    res.status(200).json({ 
      success: true, 
      message: 'Image deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting image' 
    });
  }
});

module.exports = router;