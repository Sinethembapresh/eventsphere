"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Upload, X, Image as ImageIcon, Link as LinkIcon } from "lucide-react"

export default function CreateEventPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    department: "",
    venue: "",
    date: "",
    time: "",
    endTime: "",
    maxParticipants: "",
    registrationDeadline: "",
    tags: "",
    requirements: "",
    prizes: "",
    contactEmail: "",
    imageUrl: "",
  })

  // Update registration deadline when event date changes
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setForm((prev) => {
      const newForm = { ...prev, date: value }
      // If no registration deadline is set, set it to 1 day before the event
      if (!prev.registrationDeadline && value) {
        const eventDate = new Date(value)
        const deadline = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000)
        newForm.registrationDeadline = deadline.toISOString().split('T')[0]
      }
      return newForm
    })
  }

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setForm((prev) => ({ ...prev, imageUrl: url }))
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
    setForm((prev) => ({ ...prev, imageUrl: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    // Basic validation
    if (!form.title || !form.description || !form.category || !form.venue || !form.date || !form.time) {
      toast({ title: "Missing required fields", description: "Please fill in all required fields." })
      return
    }

    // Image validation
    if (!form.imageUrl && !imageFile) {
      toast({ title: "Image required", description: "Please provide an event image." })
      return
    }

    setSubmitting(true)
    try {
      // Handle image - convert file to data URL if uploaded
      let imageUrl = form.imageUrl
      if (imageFile) {
        const reader = new FileReader()
        imageUrl = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(imageFile)
        })
      }

      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        department: form.department || undefined,
        venue: form.venue,
        date: form.date,
        time: form.time,
        endTime: form.endTime || undefined,
        maxParticipants: form.maxParticipants || undefined,
        registrationDeadline: form.registrationDeadline || (() => {
          const eventDate = new Date(form.date)
          const deadline = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000) // 1 day before
          return deadline.toISOString().split('T')[0]
        })(),
        tags: form.tags
          ? form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        requirements: form.requirements
          ? form.requirements
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        prizes: form.prizes
          ? form.prizes
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        contactInfo: form.contactEmail ? { email: form.contactEmail } : undefined,
        media: {
          images: imageUrl ? [imageUrl] : [],
          videos: [],
          documents: []
        }
      }


      // Attach JWT if available (works with both header- and cookie-based auth)
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (token) headers["Authorization"] = `Bearer ${token}`

      const res = await fetch("/api/events", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || "Failed to create event")
      }

      const data = await res.json()
      toast({ title: "Event created", description: data.message || "Awaiting approval" })
      router.push("/organizer/dashboard")
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to create event" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Create Event</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" value={form.title} onChange={handleChange} required />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" value={form.description} onChange={handleChange} required />
                </div>

                {/* Event Image */}
                <div className="md:col-span-2 space-y-4">
                  <Label>Event Image *</Label>
                  
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
                        value={form.imageUrl}
                        onChange={handleImageUrlChange}
                        required
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
                  <Input id="category" name="category" value={form.category} onChange={handleChange} placeholder="e.g., Technical, Cultural" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department (optional)</Label>
                  <Input id="department" name="department" value={form.department} onChange={handleChange} placeholder="If applicable" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Input id="venue" name="venue" value={form.venue} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" name="date" value={form.date} onChange={handleDateChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Start Time</Label>
                  <Input id="time" type="time" name="time" value={form.time} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time (optional)</Label>
                  <Input id="endTime" type="time" name="endTime" value={form.endTime} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Max Participants (optional)</Label>
                  <Input id="maxParticipants" type="number" min={1} name="maxParticipants" value={form.maxParticipants} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                  <Input id="registrationDeadline" type="date" name="registrationDeadline" value={form.registrationDeadline} onChange={handleChange} />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input id="tags" name="tags" value={form.tags} onChange={handleChange} placeholder="e.g., hackathon, workshop" />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="requirements">Requirements (comma separated)</Label>
                  <Input id="requirements" name="requirements" value={form.requirements} onChange={handleChange} placeholder="e.g., student ID, laptop" />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="prizes">Prizes (comma separated)</Label>
                  <Input id="prizes" name="prizes" value={form.prizes} onChange={handleChange} placeholder="e.g., certificates, swag" />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="contactEmail">Contact Email (optional)</Label>
                  <Input id="contactEmail" type="email" name="contactEmail" value={form.contactEmail} onChange={handleChange} />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Event"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
