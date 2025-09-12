// routes/categories.js
const express = require('express');
const router = express.Router();
const Category = require('../models/Categories'); // Fix: Changed path from '../../models/Categories'



// Add your route handlers here
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
