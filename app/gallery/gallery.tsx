"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import axiosInstance from "@/app/api/axiosInstance";
import { GalleryImage, GallerySection } from "@/types/gallery";

const categories = [
  "Academic Events",
  "Career Events",
  "Cultural Events",
  "Social Events",
  "Sports Events",
  "Technical Events"
];

// Fallback image component for Next.js Image
function ImageWithFallback({ src, alt, width = 400, height = 256 }: { src: string; alt: string; width?: number; height?: number }) {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className="w-full h-64 object-cover"
      unoptimized
      priority
      onError={() => setImgSrc("/placeholder.jpg")}
    />
  );
}

export default function Gallery() {
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<GallerySection[]>(
    categories.map(title => ({
      title,
      images: []
    }))
  );
  const [activeSection, setActiveSection] = useState<GallerySection>(sections[0]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchGalleryImages = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/api/gallery');
        console.log('Gallery response:', response.data); // Debug log
        if (response.data.success) {
          const uploadedImages: GalleryImage[] = response.data.data;
          console.log('Uploaded images:', uploadedImages); // Debug log
          
          const updatedSections = categories.map(title => {
            // Filter images for this category
            const categoryImages = uploadedImages
              .filter(img => img.category === title)
              .map(img => img.imageUrl);
              
            return {
              title,
              images: categoryImages
            };
          }); // Keep all sections, even empty ones
          
          console.log('Updated sections:', updatedSections); // Debug log
          setSections(updatedSections);
          // Find first section with images
          const firstSectionWithImages = updatedSections.find(section => section.images.length > 0);
          if (firstSectionWithImages) {
            setActiveSection(firstSectionWithImages);
          } else {
            setActiveSection(updatedSections[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching gallery images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryImages();
  }, []);

  // Slideshow logic
  useEffect(() => {
    if (activeSection.images.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSection.images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeSection]);

  const noImagesMessage = (
    <div className="text-center text-gray-500">
      No images available in this category
    </div>
  );

  return (
    <main className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-blue-600 via-pink-500 to-blue-400 text-transparent bg-clip-text">
        Event Gallery
      </h1>
      <div className="flex flex-row gap-8">
        {/* Left Section Buttons */}
        <div className="flex flex-col gap-4 items-start justify-center mr-8">
          {sections.slice(0, Math.ceil(sections.length / 2)).map((section) => (
            <button
              key={section.title}
              onClick={() => {
                setActiveSection(section);
                setCurrentIndex(0);
              }}
              className={`px-4 py-2 rounded-lg shadow-md text-left w-40 transition-all duration-200 font-semibold border-2 
                ${activeSection.title === section.title 
                  ? "bg-blue-600 text-white border-blue-600" 
                  : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-blue-100 hover:border-blue-400"}`}
            >
              {section.title}
            </button>
          ))}
        </div>

        {/* Slideshow center */}
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="relative w-full max-w-xl h-80 flex items-center justify-center overflow-hidden rounded-lg shadow-lg bg-gray-100">
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            ) : activeSection.images.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection.images[currentIndex]}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="absolute w-full h-full"
                >
                  <img
                    src={activeSection.images[currentIndex]}
                    alt={`${activeSection.title} image`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>
            ) : (
              noImagesMessage
            )}
          </div>

          {/* Navigation Dots */}
          {activeSection.images.length > 0 && (
            <div className="flex gap-2 mt-4">
              {activeSection.images.map((_, idx) => (
                <button
                  key={idx}
                  aria-label={`Go to image ${idx + 1}`}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentIndex === idx ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Section Buttons */}
        <div className="flex flex-col gap-4 items-start justify-center ml-8">
          {sections.slice(Math.ceil(sections.length / 2)).map((section) => (
            <button
              key={section.title}
              onClick={() => {
                setActiveSection(section);
                setCurrentIndex(0);
              }}
              className={`px-4 py-2 rounded-lg shadow-md text-left w-40 transition-all duration-200 font-semibold border-2 
                ${activeSection.title === section.title 
                  ? "bg-blue-600 text-white border-blue-600" 
                  : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-blue-100 hover:border-blue-400"}`}
            >
              {section.title}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
