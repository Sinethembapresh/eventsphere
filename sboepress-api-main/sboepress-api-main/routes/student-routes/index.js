const express = require('express');
const router = express.Router();

router.get('/dashboard', async (req, res) => {
  try {
    const studentData = await req.user
      .populate('registrations')
      .populate('feedback');
    
    res.json({
      success: true,
      data: {
        user: {
          id: studentData._id,
          email: studentData.email,
          fullName: studentData.full_name,
          role: studentData.role
        },
        registrations: studentData.registrations,
        feedback: studentData.feedback
      }
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load student dashboard'
    });
  }
});

module.exports = router;
