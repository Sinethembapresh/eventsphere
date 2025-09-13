"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Loader2, Image as ImageIcon, Edit2, Trash2, Upload, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface GalleryMedia {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  category: string;
  tags?: string[];
}

const CATEGORIES = [
  { label: "All", value: "all", color: "bg-gray-100 text-gray-800" },
  { label: "Academic", value: "academic", color: "bg-blue-100 text-blue-800" },
  { label: "Career", value: "career", color: "bg-green-100 text-green-800" },
  { label: "Cultural", value: "cultural", color: "bg-purple-100 text-purple-800" },
  { label: "Social", value: "social", color: "bg-pink-100 text-pink-800" },
  { label: "Sports", value: "sports", color: "bg-orange-100 text-orange-800" },
  { label: "Technical", value: "technical", color: "bg-indigo-100 text-indigo-800" },
];

export default function GalleryManagement() {
  const [images, setImages] = useState<GalleryMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editImage, setEditImage] = useState<GalleryMedia | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "", category: "academic", tags: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/admin/gallery", {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch images");
      const data = await res.json();
      setImages(data.images || data);
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Failed to fetch gallery images");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", category: "academic", tags: "" });
    setFile(null);
    setEditImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.category) {
      toast.error("Category is required");
      return;
    }
    if (!file && !editImage) {
      toast.error("Please select an image file");
      return;
    }
    
    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("description", formData.description);
    fd.append("category", formData.category);
    if (formData.tags.trim()) {
      const tagsArray = formData.tags.split(",").map((t) => t.trim()).filter((t) => t);
      fd.append("tags", JSON.stringify(tagsArray));
    }
    if (file) fd.append("file", file);
    
    console.log("Form data:", {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      tags: formData.tags,
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    });

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      if (editImage) {
        // Update existing image
        const updateData = {
          imageId: editImage._id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          tags: formData.tags
        };
        
        const res = await fetch("/api/admin/gallery", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(updateData)
        });
        
        if (!res.ok) throw new Error("Failed to update image");
        toast.success("Image updated successfully");
      } else {
        // Upload new image
        const res = await fetch("/api/admin/gallery", {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: fd
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error("Upload error response:", errorData);
          throw new Error(errorData.error || "Failed to upload image");
        }
        toast.success("Image uploaded successfully");
      }

      fetchImages();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving image:", error);
      toast.error(editImage ? "Failed to update image" : "Failed to upload image");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`/api/admin/gallery?id=${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to delete image");
      toast.success("Image deleted successfully");
      fetchImages();
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  const handleEdit = (image: GalleryMedia) => {
    setEditImage(image);
    setFormData({
      title: image.title,
      description: image.description || "",
      category: image.category,
      tags: image.tags ? image.tags.join(", ") : "",
    });
    setIsDialogOpen(true);
  };

  const filteredImages = images.filter((image) => {
    const matchesCategory = selectedCategory === "all" || image.category === selectedCategory;
    const matchesSearch =
      image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (image.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (image.tags || []).some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryInfo = (categoryValue: string) =>
    CATEGORIES.find((cat) => cat.value === categoryValue) || CATEGORIES[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">Gallery Management</h2>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Image
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.value)}
              className={`whitespace-nowrap ${selectedCategory === category.value ? category.color : ""}`}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Gallery */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-gray-500">Loading gallery images...</p>
          </div>
        </div>
      ) : filteredImages.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No images found</p>
              <p className="text-sm text-gray-400">
                {selectedCategory === "all"
                  ? "Upload some images to get started"
                  : `No images in ${CATEGORIES.find((c) => c.value === selectedCategory)?.label} category`}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredImages.map((image) => {
            const categoryInfo = getCategoryInfo(image.category);
            return (
              <Card key={image._id} className="overflow-hidden">
                <div className="aspect-video relative">
                  <img src={image.imageUrl} alt={image.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2">
                    <Badge className={categoryInfo.color}>{categoryInfo.label}</Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-1 truncate">{image.title}</h3>
                  {image.description && <p className="text-xs text-gray-600 mb-2 line-clamp-2">{image.description}</p>}

                  {image.tags && image.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {image.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs px-1 py-0">
                          {tag}
                        </Badge>
                      ))}
                      {image.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          +{image.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => handleEdit(image)}>
                      <Edit2 className="h-3 w-3" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" className="gap-1" onClick={() => handleDelete(image._id)}>
                      <Trash2 className="h-3 w-3" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editImage ? "Edit Image" : "Add New Image"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="title" placeholder="Title" value={formData.title} onChange={handleInputChange} required />
            <Input name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} />
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full border rounded-md p-2"
            >
              {CATEGORIES.filter((c) => c.value !== "all").map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <Input
              name="tags"
              placeholder="Tags (comma separated)"
              value={formData.tags}
              onChange={handleInputChange}
            />
            <div className="flex items-center gap-2">
              <Input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} />
              {file && (
                <div className="flex items-center gap-1">
                  <span className="text-sm">{file.name}</span>
                  <Button type="button" size="icon" variant="ghost" onClick={() => setFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit" className="gap-2">
                <Upload className="h-4 w-4" />
                {editImage ? "Update" : "Upload"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
