'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';
import axiosInstance from '@/app/api/axiosInstance';

export const GalleryApproval = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/api/gallery', {
        imageUrl,
        category,
      });

      if (response.data.success) {
        toast.success('Image added successfully!');
        setImageUrl('');
        setCategory('');
        // Refresh images list
        fetchImages();
      } else {
        throw new Error(response.data.message || 'Failed to add image');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to add image');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchImages = async () => {
    try {
      const response = await axiosInstance.get('/api/gallery');
      if (response.data.success) {
        setImages(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await axiosInstance.delete(`/api/gallery/${id}`);
      if (response.data.success) {
        toast.success('Image deleted successfully');
        fetchImages();
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Image</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="Enter image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Academic Events">Academic Events</SelectItem>
                  <SelectItem value="Career Events">Career Events</SelectItem>
                  <SelectItem value="Cultural Events">Cultural Events</SelectItem>
                  <SelectItem value="Social Events">Social Events</SelectItem>
                  <SelectItem value="Sports Events">Sports Events</SelectItem>
                  <SelectItem value="Technical Events">Technical Events</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {imageUrl && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Preview:</h3>
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full max-w-md h-48 object-cover rounded-lg"
                />
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Adding...' : 'Add Image'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gallery Images</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image: any) => (
              <div key={image._id} className="relative group">
                <img
                  src={image.imageUrl}
                  alt={image.category}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(image._id)}
                  >
                    Delete
                  </Button>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium capitalize">{image.category}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};