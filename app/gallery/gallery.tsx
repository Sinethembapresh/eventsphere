"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import type { GalleryMedia } from "@/lib/models/GalleryMedia";


// Fallback image component for Next.js Image
function ImageWithFallback({ 
  src, 
  alt, 
  width = 400, 
  height = 256, 
  className = "w-full h-full object-cover rounded-xl" 
}: { 
  src: string; 
  alt: string; 
  width?: number; 
  height?: number; 
  className?: string; 
}) {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      unoptimized
      priority
      onError={() => setImgSrc("/placeholder.jpg")}
    />
  );
}

const CATEGORIES = [
  { key: 'all', title: 'All Events', icon: '🌐' },
  { key: 'academic', title: 'Academic', icon: '📚' },
  { key: 'career', title: 'Career', icon: '💼' },
  { key: 'cultural', title: 'Cultural', icon: '🎭' },
  { key: 'social', title: 'Social', icon: '🎉' },
  { key: 'sports', title: 'Sports', icon: '⚽' },
  { key: 'technical', title: 'Technical', icon: '💻' },
];

export default function Gallery() {
  const [galleryImages, setGalleryImages] = useState<GalleryMedia[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<GalleryMedia | null>(null);

  // Fetch gallery images from API
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('/api/gallery');
        if (response.ok) {
          const data = await response.json();
          setGalleryImages(data.images || []);
          setCategoryCounts(data.categoryCounts || {});
        } else {
          console.error('Failed to fetch gallery images:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Failed to fetch gallery images:', error);

      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Get filtered images
  const getFilteredImages = () => {
    return selectedCategory === 'all' ? galleryImages : galleryImages.filter(img => img.category === selectedCategory);
  };

  // Close full-screen modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  const noImagesMessage = (
    <div className="text-center text-gray-500">
      No images available in this category
    </div>
  );

  return (

    <main className="max-w-7xl mx-auto px-4 py-12 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl md:text-5xl font-extrabold text-center mb-12 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-transparent bg-clip-text"
      >
        Event Gallery
      </motion.h1>

     
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {CATEGORIES.map((category) => {
          const imageCount = category.key === 'all' ? galleryImages.length : categoryCounts[category.key] || 0;
          return (
            <motion.button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm md:text-base transition-all duration-300 border border-white/20 backdrop-blur-md
                ${selectedCategory === category.key
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'bg-white/10 dark:bg-gray-800/30 text-gray-800 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/30'
                }`}
            >
              <span>{category.icon}</span>
              <span>{category.title}</span>
              <span className="bg-white/20 dark:bg-gray-900/50 px-2 py-0.5 rounded-full text-xs">{imageCount}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Gallery Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-20"
          >
            <div className="text-gray-600 dark:text-gray-300 text-lg font-medium flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Loading gallery...
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {getFilteredImages().length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full flex items-center justify-center py-20"
              >
                <div className="text-center">
                  <div className="text-gray-600 dark:text-gray-300 text-lg font-semibold mb-2">No images available</div>
                  <div className="text-gray-500 dark:text-gray-400">
                    {selectedCategory === 'all'
                      ? 'Upload some images to get started'
                      : `No images in ${CATEGORIES.find(c => c.key === selectedCategory)?.title} category`}
                  </div>
                </div>
              </motion.div>
            ) : (
              getFilteredImages().map((image) => (
                <motion.div
                  key={image._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="aspect-[4/3] relative">
                    <ImageWithFallback
                      src={image.imageUrl}
                      alt={image.title}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Image Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/80 to-transparent">
                    <h3 className="text-white font-semibold text-lg mb-1">{image.title}</h3>
                    {image.description && (
                      <p className="text-gray-200 text-sm line-clamp-2">{image.description}</p>
                    )}
                    {image.tags && image.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {image.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-purple-500/80 text-white px-2 py-1 rounded-full backdrop-blur-sm"
                          >
                            {tag}
                          </span>
                        ))}
                        {image.tags.length > 3 && (
                          <span className="text-xs bg-gray-500/80 text-white px-2 py-1 rounded-full backdrop-blur-sm">
                            +{image.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-Screen Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-4xl w-full mx-4 p-4 bg-white/10 dark:bg-gray-900/10 backdrop-blur-md rounded-xl shadow-xl"
              onClick={(e) => e.stopPropagation()}

            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 dark:bg-gray-800/20 text-white hover:bg-white/30 dark:hover:bg-gray-700/30 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="relative aspect-[4/3] max-h-[80vh] w-full">
                <ImageWithFallback
                  src={selectedImage.imageUrl}
                  alt={selectedImage.title}
                  width={1200}
                  height={900}
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-white font-semibold text-xl mb-2">{selectedImage.title}</h3>
                {selectedImage.description && (
                  <p className="text-gray-200 text-sm">{selectedImage.description}</p>
                )}
                {selectedImage.tags && selectedImage.tags.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {selectedImage.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-purple-500/80 text-white px-3 py-1 rounded-full backdrop-blur-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}