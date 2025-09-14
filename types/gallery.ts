export interface GalleryImage {
  _id: string;
  imageUrl: string;
  category: string;
  createdAt: Date;
}

export interface GallerySection {
  title: string;
  images: string[];
}