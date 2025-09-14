import mongoose from 'mongoose';

const galleryImageSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['wedding', 'corporate', 'birthday', 'concert', 'other'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const GalleryImage = mongoose.models.GalleryImage || mongoose.model('GalleryImage', galleryImageSchema);

export default GalleryImage;