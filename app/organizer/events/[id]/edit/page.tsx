"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Upload, X, Image as ImageIcon, Link as LinkIcon } from "lucide-react"

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url')

  const authHeaders = () => {
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) headers["Authorization"] = `Bearer ${token}`
    }
    return headers
  }

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/events/${params.id}`)
        if (!res.ok) throw new Error("Event not found")
        const data = await res.json()
        setForm({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "",
          venue: data.venue || "",
          date: data.date ? new Date(data.date).toISOString().substring(0, 10) : "",
          time: data.time || "",
          endTime: data.endTime || "",
          maxParticipants: data.maxParticipants ?? "",
          imageUrl: data.media?.images?.[0] || "",
        })
        
        // Set image preview if there's an existing image
        if (data.media?.images?.[0]) {
          setImagePreview(data.media.images[0])
        }
      } catch (e: any) {
        toast({ title: "Error", description: e.message || "Failed to load event" })
        router.back()
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((p: any) => ({ ...p, [name]: value }))
  }

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setForm((prev: any) => ({ ...prev, imageUrl: url }))
    if (url) {
      setImagePreview(url)
    } else {
      setImagePreview(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPEG, PNG, GIF, etc.)",
          variant: "destructive"
        })
        return
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        })
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setForm((prev: any) => ({ ...prev, imageUrl: "" }))
  }

  const buildPayload = async () => {
    const payload: Record<string, any> = {}
    if (form.title?.trim()) payload.title = form.title.trim()
    if (form.description?.trim()) payload.description = form.description.trim()
    if (form.category?.trim()) payload.category = form.category.trim()
    if (form.venue?.trim()) payload.venue = form.venue.trim()
    if (form.date) payload.date = form.date
    if (form.time) payload.time = form.time
    if (form.endTime) payload.endTime = form.endTime
    if (form.maxParticipants !== "" && form.maxParticipants !== null && form.maxParticipants !== undefined) {
      const n = Number(form.maxParticipants)
      if (!Number.isNaN(n)) payload.maxParticipants = n
    }
    
    // Handle image
    let imageUrl = form.imageUrl
    if (imageFile && !imageUrl) {
      const reader = new FileReader()
      imageUrl = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(imageFile)
      })
    }
    
    if (imageUrl) {
      payload.media = {
        images: [imageUrl],
        videos: [],
        documents: []
      }
    }
    
    return payload
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    try {
      const body = await buildPayload()
      const res = await fetch(`/api/events/${params.id}`, {
        method: "PUT",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Failed to update event")
      toast({ title: "Saved", description: "Event updated successfully" })
      router.push(`/events/${params.id}`)
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to save" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="animate-pulse h-24 bg-gray-200 rounded" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSave}>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" value={form.title || ""} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={form.description || ""} onChange={handleChange} required />
            </div>

            {/* Event Image */}
            <div className="space-y-4">
              <Label>Event Image</Label>
              
              {/* Upload Method Selection */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={uploadMethod === 'url' ? 'default' : 'outline'}
                  onClick={() => setUploadMethod('url')}
                  className="flex items-center gap-2"
                >
                  <LinkIcon className="h-4 w-4" />
                  Image URL
                </Button>
                <Button
                  type="button"
                  variant={uploadMethod === 'file' ? 'default' : 'outline'}
                  onClick={() => setUploadMethod('file')}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload File
                </Button>
              </div>

              {/* Image URL Input */}
              {uploadMethod === 'url' && (
                <div className="space-y-2">
                  <Input
                    type="url"
                    placeholder="https://example.com/event-image.jpg"
                    value={form.imageUrl || ""}
                    onChange={handleImageUrlChange}
                  />
                  <p className="text-sm text-gray-500">
                    Enter a direct URL to an image (JPEG, PNG, GIF, WebP)
                  </p>
                </div>
              )}

              {/* File Upload */}
              {uploadMethod === 'file' && (
                <div className="space-y-2">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      {imageFile ? (
                        <div className="space-y-2">
                          <ImageIcon className="h-8 w-8 text-green-500 mx-auto" />
                          <p className="text-sm font-medium">{imageFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                          <p className="text-sm font-medium">Click to upload image</p>
                          <p className="text-xs text-gray-500">
                            JPEG, PNG, GIF, WebP (max 5MB)
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              )}

              {/* Image Preview */}
              {imagePreview && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Event preview"
                      className="w-48 h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={removeImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" value={form.category || ""} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="venue">Venue</Label>
                <Input id="venue" name="venue" value={form.venue || ""} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" name="date" value={form.date || ""} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" name="time" value={form.time || ""} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input id="endTime" type="time" name="endTime" value={form.endTime || ""} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <Input id="maxParticipants" type="number" name="maxParticipants" value={form.maxParticipants ?? ""} onChange={handleChange} />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
