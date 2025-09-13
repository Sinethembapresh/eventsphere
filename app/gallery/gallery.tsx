"use client"; 

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import type { GalleryMedia } from "@/lib/models/GalleryMedia";

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

const CATEGORIES = [
  { key: 'academic', title: 'Academic Events', fallbackImages: [
    "/Photos/academics/acad1.jpg",
    "/Photos/academics/acad2.jpg",
    "/Photos/academics/acad3.jpg",
    "/Photos/academics/acad4.jpg",
    "/Photos/academics/acad5.jpg",
    "/Photos/academics/acad6.jpg",
    "/Photos/academics/acad7.jpg",
  ]},
  { key: 'career', title: 'Career Events', fallbackImages: [
    "/Photos/career/career1.jpg",
    "/Photos/career/career2.jpg",
    "/Photos/career/career3.jpg",
    "/Photos/career/career4.jpg",
    "/Photos/career/career5.jpg",
    "/Photos/career/career6.jpg",
    "/Photos/career/career7.jpg",
  ]},
  { key: 'cultural', title: 'Cultural Events', fallbackImages: [
    "/Photos/cultural/cult1.jpg",
    "/Photos/cultural/cult2.jpg",
    "/Photos/cultural/cult3.jpg",
    "/Photos/cultural/cult4.jpg",
    "/Photos/cultural/cult5.jpg",
    "/Photos/cultural/cult6.jpg",
    "/Photos/cultural/cult7.jpg",
  ]},
  { key: 'social', title: 'Social Events', fallbackImages: [
    "/Photos/social/social1.jpg",
    "/Photos/social/social2.jpg",
    "/Photos/social/social3.jpg",
    "/Photos/social/social4.jpg",
    "/Photos/social/social5.jpg",
    "/Photos/social/social6.jpg",
    "/Photos/social/social7.jpg",
  ]},
  { key: 'sports', title: 'Sports Events', fallbackImages: [
    "/Photos/sports/sport1.jpg",
    "/Photos/sports/sport2.jpg",
    "/Photos/sports/sport3.jpg",
    "/Photos/sports/sport3.png",
    "/Photos/sports/sport4.jpg",
    "/Photos/sports/sport5.jpg",
    "/Photos/sports/sport6.jpg",
    "/Photos/sports/sport7.jpg",
  ]},
  { key: 'technical', title: 'Technical Events', fallbackImages: [
    "/Photos/technical/tech1.jpg",
    "/Photos/technical/tech2.jpg",
    "/Photos/technical/tech3.png",
    "/Photos/technical/tech4.jpg",
    "/Photos/technical/tech5.jpg",
    "/Photos/technical/tech6.jpg",
    "/Photos/technical/tech7.jpg",
  ]},
];

export default function Gallery() {
  const [galleryImages, setGalleryImages] = useState<GalleryMedia[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(CATEGORIES[0]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch gallery images from API
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('/api/gallery');
        if (response.ok) {
          const data = await response.json();
          setGalleryImages(data.images || []);
          setCategoryCounts(data.categoryCounts || {});
        }
      } catch (error) {
        console.error('Failed to fetch gallery images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Get images for current category
  const getCurrentImages = () => {
    const categoryImages = galleryImages.filter(img => img.category === activeSection.key);
    return categoryImages.length > 0 ? categoryImages.map(img => img.imageUrl) : activeSection.fallbackImages;
  };

  // Slideshow logic
  React.useEffect(() => {
    const images = getCurrentImages();
    if (images.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 4000); // Slower speed: 4000ms
      return () => clearInterval(timer);
    }
  }, [activeSection, galleryImages]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-blue-600 via-pink-500 to-blue-400 text-transparent bg-clip-text">Gallery</h1>
      <div className="flex flex-row gap-8">
        {/* Left Section Buttons */}
        <div className="flex flex-col gap-4 items-start justify-center mr-8">
          {CATEGORIES.slice(0, Math.ceil(CATEGORIES.length / 2)).map((section, idx) => {
            const imageCount = categoryCounts[section.key] || 0;
            return (
              <button
                key={section.title}
                className={`px-4 py-2 rounded-lg shadow-md text-left w-40 transition-all duration-200 font-semibold border-2 ${activeSection.title === section.title ? "bg-blue-600 text-white border-blue-600" : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-blue-100 hover:border-blue-400"}`}
                onClick={() => { setActiveSection(section); setCurrentIndex(0); }}
              >
                <div className="flex justify-between items-center">
                  <span>{section.title}</span>
                  {imageCount > 0 && (
                    <span className={`text-xs px-1 rounded ${activeSection.title === section.title ? "bg-blue-200 text-blue-900" : "bg-blue-100 text-blue-800"}`}>
                      {imageCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {/* Slideshow center */}
        <div className="flex flex-col items-center justify-center flex-1">
          {loading ? (
            <div className="w-full max-w-xl h-80 flex items-center justify-center">
              <div className="text-gray-500">Loading gallery...</div>
            </div>
          ) : (
            <>
              <div className="relative w-full max-w-xl h-80 flex items-center justify-center overflow-hidden">
                <AnimatePresence initial={false} mode="wait">
                  {(() => {
                    const images = getCurrentImages();
                    if (images.length === 0) {
                      return (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                          <div className="text-gray-500 text-center">
                            <div className="text-lg font-semibold mb-2">No images available</div>
                            <div className="text-sm">Check back later for {activeSection.title.toLowerCase()}</div>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <motion.div
                        key={images[currentIndex]}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.6 }}
                        className="absolute w-full h-full flex items-center justify-center"
                      >
                        <ImageWithFallback
                          src={images[currentIndex]}
                          alt={activeSection.title + " image"}
                          width={600}
                          height={320}
                        />
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </div>
              {/* Slideshow dots */}
              {(() => {
                const images = getCurrentImages();
                if (images.length > 1) {
                  return (
                    <div className="flex flex-row justify-center mt-4 gap-2">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          className={`w-3 h-3 rounded-full ${currentIndex === idx ? "bg-blue-600" : "bg-blue-200"}`}
                          onClick={() => setCurrentIndex(idx)}
                          aria-label={`Go to image ${idx + 1}`}
                        />
                      ))}
                    </div>
                  );
                }
                return null;
              })()}
            </>
          )}
        </div>
        {/* Right Section Buttons */}
        <div className="flex flex-col gap-4 items-start justify-center ml-8">
          {CATEGORIES.slice(Math.ceil(CATEGORIES.length / 2)).map((section, idx) => {
            const imageCount = categoryCounts[section.key] || 0;
            return (
              <button
                key={section.title}
                className={`px-4 py-2 rounded-lg shadow-md text-left w-40 transition-all duration-200 font-semibold border-2 ${activeSection.title === section.title ? "bg-blue-600 text-white border-blue-600" : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-blue-100 hover:border-blue-400"}`}
                onClick={() => { setActiveSection(section); setCurrentIndex(0); }}
              >
                <div className="flex justify-between items-center">
                  <span>{section.title}</span>
                  {imageCount > 0 && (
                    <span className={`text-xs px-1 rounded ${activeSection.title === section.title ? "bg-blue-200 text-blue-900" : "bg-blue-100 text-blue-800"}`}>
                      {imageCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
