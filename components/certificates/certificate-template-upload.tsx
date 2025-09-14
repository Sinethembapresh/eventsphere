"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, X, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Event } from "@/lib/models/Event"

interface CertificateTemplateUploadProps {
  events: (Event & { _id: string })[]
  onTemplateCreated?: () => void
}

export function CertificateTemplateUpload({ events, onTemplateCreated }: CertificateTemplateUploadProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedEventId, setSelectedEventId] = useState("global")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPEG, PNG, GIF, or PDF file",
          variant: "destructive"
        })
        return
      }

      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive"
        })
        return
      }

      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !file) {
      toast({
        title: "Missing required fields",
        description: "Please provide a name and select a file",
        variant: "destructive"
      })
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('description', description.trim())
      if (selectedEventId && selectedEventId !== 'global') {
        formData.append('eventId', selectedEventId)
      }
      formData.append('file', file)

      const token = localStorage.getItem("token")
      const response = await fetch('/api/organizer/certificate-templates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
        credentials: "include"
      })

      if (response.ok) {
        toast({
          title: "Template Created",
          description: "Certificate template uploaded successfully",
        })
        
        // Reset form
        setName("")
        setDescription("")
        setSelectedEventId("global")
        setFile(null)
        
        onTemplateCreated?.()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to upload template")
      }
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Please try again later",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload Certificate Template
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Event Participation Certificate"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this certificate template..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event">Event (Optional)</Label>
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an event (or leave blank for global template)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Global Template</SelectItem>
                {events.map((event) => (
                  <SelectItem key={event._id} value={event._id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Template File *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.gif,.pdf"
                className="hidden"
              />
              <label htmlFor="file" className="cursor-pointer">
                {file ? (
                  <div className="space-y-2">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFile(null)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                    <p className="text-sm font-medium">Click to upload template</p>
                    <p className="text-xs text-gray-500">
                      JPEG, PNG, GIF, or PDF (max 10MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <Button type="submit" disabled={uploading || !name.trim() || !file} className="w-full">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Template
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
