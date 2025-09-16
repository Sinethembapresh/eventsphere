"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import type { GalleryMedia } from "@/lib/models/GalleryMedia";

function ImageWithFallback({ src, alt, width = 400, height = 256, className = "w-full h-full object-cover rounded-xl" }: { src: string; alt: string; width?: number; height?: number; className?: string }) {
  const [imgSrc, setImgSrc] = useState(src);
  return <Image src={imgSrc} alt={alt} width={width} height={height} className={className} unoptimized priority onError={() => setImgSrc("/placeholder.jpg")} />;
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
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';

  const [galleryImages, setGalleryImages] = useState<GalleryMedia[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedImage, setSelectedImage] = useState<GalleryMedia | null>(null);

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('/api/gallery');
        if (response.ok) {
          const data = await response.json();
          setGalleryImages(data.images || []);
          setCategoryCounts(data.categoryCounts || {});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  const getFilteredImages = () => selectedCategory === 'all' ? galleryImages : galleryImages.filter(img => img.category === selectedCategory);

  return (
    <main className="max-w-7xl mx-auto px-4 py-12 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <motion.h1 className="text-4xl md:text-5xl font-extrabold text-center mb-12 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-transparent bg-clip-text">
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
          <motion.div className="flex items-center justify-center py-20 text-gray-600 dark:text-gray-300 text-lg font-medium">
            Loading gallery...
          </motion.div>
        ) : (
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {getFilteredImages().length === 0 ? (
              <div className="col-span-full flex items-center justify-center py-20 text-gray-500">No images in this category</div>
            ) : (
              getFilteredImages().map((image) => (
                <motion.div key={image._id} className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm cursor-pointer" onClick={() => setSelectedImage(image)}>
                  <div className="aspect-[4/3] relative">
                    <ImageWithFallback src={image.imageUrl} alt={image.title} width={400} height={300} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/80 to-transparent">
                    <h3 className="text-white font-semibold text-lg mb-1">{image.title}</h3>
                    {image.description && <p className="text-gray-200 text-sm line-clamp-2">{image.description}</p>}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
