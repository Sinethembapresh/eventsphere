"use client"; 

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

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

const gallerySections = [
  {
    title: "Academic Events",
    images: [
      "/Photos/academics/acad1.jpg",
      "/Photos/academics/acad2.jpg",
      "/Photos/academics/acad3.jpg",
      "/Photos/academics/acad4.jpg",
      "/Photos/academics/acad5.jpg",
      "/Photos/academics/acad6.jpg",
      "/Photos/academics/acad7.jpg",
    ],
  },
  {
    title: "Career Events",
    images: [
      "/Photos/career/career1.jpg",
      "/Photos/career/career2.jpg",
      "/Photos/career/career3.jpg",
      "/Photos/career/career4.jpg",
      "/Photos/career/career5.jpg",
      "/Photos/career/career6.jpg",
      "/Photos/career/career7.jpg",
    ],
  },
  {
    title: "Cultural Events",
    images: [
      "/Photos/cultural/cult1.jpg",
      "/Photos/cultural/cult2.jpg",
      "/Photos/cultural/cult3.jpg",
      "/Photos/cultural/cult4.jpg",
      "/Photos/cultural/cult5.jpg",
      "/Photos/cultural/cult6.jpg",
      "/Photos/cultural/cult7.jpg",
    ],
  },
  {
    title: "Social Events",
    images: [
      "/Photos/social/social1.jpg",
      "/Photos/social/social2.jpg",
      "/Photos/social/social3.jpg",
      "/Photos/social/social4.jpg",
      "/Photos/social/social5.jpg",
      "/Photos/social/social6.jpg",
      "/Photos/social/social7.jpg",
    ],
  },
  {
    title: "Sports Events",
    images: [
      "/Photos/sports/sport1.jpg",
      "/Photos/sports/sport2.jpg",
      "/Photos/sports/sport3.jpg",
      "/Photos/sports/sport3.png",
      "/Photos/sports/sport4.jpg",
      "/Photos/sports/sport5.jpg",
      "/Photos/sports/sport6.jpg",
      "/Photos/sports/sport7.jpg",
    ],
  },
  {
    title: "Technical Events",
    images: [
      "/Photos/technical/tech1.jpg",
      "/Photos/technical/tech2.jpg",
      "/Photos/technical/tech3.png",
      "/Photos/technical/tech4.jpg",
      "/Photos/technical/tech5.jpg",
      "/Photos/technical/tech6.jpg",
      "/Photos/technical/tech7.jpg",
    ],
  },
];

export default function Gallery() {
  const [activeSection, setActiveSection] = useState(gallerySections[0]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Slideshow logic
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSection.images.length);
    }, 4000); // Slower speed: 4000ms
    return () => clearInterval(timer);
  }, [activeSection]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-blue-600 via-pink-500 to-blue-400 text-transparent bg-clip-text">Gallery</h1>
      <div className="flex flex-row gap-8">
        {/* Left Section Buttons */}
        <div className="flex flex-col gap-4 items-start justify-center mr-8">
          {gallerySections.slice(0, Math.ceil(gallerySections.length / 2)).map((section, idx) => (
            <button
              key={section.title}
              className={`px-4 py-2 rounded-lg shadow-md text-left w-40 transition-all duration-200 font-semibold border-2 ${activeSection.title === section.title ? "bg-blue-600 text-white border-blue-600" : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-blue-100 hover:border-blue-400"}`}
              onClick={() => { setActiveSection(section); setCurrentIndex(0); }}
            >
              {section.title}
            </button>
          ))}
        </div>
        {/* Slideshow center */}
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="relative w-full max-w-xl h-80 flex items-center justify-center overflow-hidden">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={activeSection.images[currentIndex]}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.6 }}
                className="absolute w-full h-full flex items-center justify-center"
              >
                <ImageWithFallback
                  src={activeSection.images[currentIndex]}
                  alt={activeSection.title + " image"}
                  width={600}
                  height={320}
                />
              </motion.div>
            </AnimatePresence>
          </div>
          {/* Slideshow dots */}
          <div className="flex flex-row justify-center mt-4 gap-2">
            {activeSection.images.map((img, idx) => (
              <button
                key={idx}
                className={`w-3 h-3 rounded-full ${currentIndex === idx ? "bg-blue-600" : "bg-blue-200"}`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        </div>
        {/* Right Section Buttons */}
        <div className="flex flex-col gap-4 items-start justify-center ml-8">
          {gallerySections.slice(Math.ceil(gallerySections.length / 2)).map((section, idx) => (
            <button
              key={section.title}
              className={`px-4 py-2 rounded-lg shadow-md text-left w-40 transition-all duration-200 font-semibold border-2 ${activeSection.title === section.title ? "bg-blue-600 text-white border-blue-600" : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-blue-100 hover:border-blue-400"}`}
              onClick={() => { setActiveSection(section); setCurrentIndex(0); }}
            >
              {section.title}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
