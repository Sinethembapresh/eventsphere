const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const Gallery = require('../models/Gallery');

// Get all gallery images
router.get('/', async (req, res) => {
  try {
    const images = await Gallery.find().sort({ createdAt: -1 });
    res.json({ success: true, data: images });
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    res.status(500).json({ success: false, message: 'Error fetching images' });
  }
});

// Add new image (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { imageUrl, category } = req.body;
    if (!imageUrl || !category) {
      return res.status(400).json({ success: false, message: 'Image URL and category are required' });
    }

    const newImage = new Gallery({
      imageUrl,
      category,
      uploadedBy: req.user._id
    });

    await newImage.save();
    res.json({ success: true, data: newImage });
  } catch (error) {
    console.error('Error adding image:', error);
    res.status(500).json({ success: false, message: 'Error adding image' });
  }
});

// Delete image (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const image = await Gallery.findByIdAndDelete(req.params.id);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ success: false, message: 'Error deleting image' });
  }
});

module.exports = router;