"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  FileText, 
  Upload, 
  Search, 
  Edit, 
  Trash2, 
  Plus,
  ArrowLeft
} from "lucide-react"
import { useRouter } from "next/navigation"
import { CertificateTemplateUpload } from "@/components/certificates/certificate-template-upload"
import { useToast } from "@/components/ui/use-toast"
import type { CertificateTemplate } from "@/lib/models/Certificate"
import type { Event } from "@/lib/models/Event"

export default function CertificateTemplatesPage() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([])
  const [events, setEvents] = useState<(Event & { _id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showUpload, setShowUpload] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchTemplates()
    fetchEvents()
  }, [])

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch('/api/organizer/certificate-templates', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: "include"
      })

      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch('/api/organizer/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: "include"
      })

      if (response.ok) {
        const data = await response.json()
        setEvents(data.events)
      }
    } catch (error) {
      console.error("Failed to fetch events:", error)
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/organizer/certificate-templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: "include"
      })

      if (response.ok) {
        toast({
          title: "Template Deleted",
          description: "Certificate template has been deleted successfully",
        })
        fetchTemplates()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete template")
      }
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "Please try again later",
        variant: "destructive"
      })
    }
  }

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Certificate Templates</h1>
              <p className="text-gray-600">Upload and manage certificate templates for your events</p>
            </div>
          </div>
          <Button onClick={() => setShowUpload(!showUpload)}>
            <Plus className="h-4 w-4 mr-2" />
            {showUpload ? 'Hide Upload' : 'Upload Template'}
          </Button>
        </div>

        {/* Upload Form */}
        {showUpload && (
          <div className="mb-8">
            <CertificateTemplateUpload 
              events={events}
              onTemplateCreated={() => {
                fetchTemplates()
                setShowUpload(false)
              }}
            />
          </div>
        )}

        {/* Templates List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Your Templates ({templates.length})
              </CardTitle>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading templates...</p>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No templates found' : 'No templates yet'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm 
                    ? 'No templates match your search criteria' 
                    : 'Upload your first certificate template to get started'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowUpload(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Template
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <Card key={template._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 line-clamp-2">{template.name}</h3>
                          {template.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{template.description}</p>
                          )}
                        </div>
                        <Badge variant={template.isActive ? "default" : "secondary"}>
                          {template.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Event:</strong> {template.eventId ? 'Specific Event' : 'Global Template'}</p>
                        <p><strong>Created:</strong> {new Date(template.createdAt).toLocaleDateString()}</p>
                        <p><strong>Updated:</strong> {new Date(template.updatedAt).toLocaleDateString()}</p>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(template.templateUrl, '_blank')}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTemplate(template._id!)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
