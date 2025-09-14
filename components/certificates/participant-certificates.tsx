"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Award, 
  Download, 
  Search, 
  Eye, 
  CheckCircle, 
  Clock, 
  FileText,
  ExternalLink
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Certificate } from "@/lib/models/Certificate"

interface ParticipantCertificatesProps {
  onCertificateAction?: () => void
}

export function ParticipantCertificates({ onCertificateAction }: ParticipantCertificatesProps) {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const response = await fetch(`/api/certificates?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: "include"
      })

      if (response.ok) {
        const data = await response.json()
        setCertificates(data.certificates)
      }
    } catch (error) {
      console.error("Failed to fetch certificates:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCertificate = async (certificateId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/certificates/${certificateId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: "include"
      })

      if (response.ok) {
        const data = await response.json()
        // In a real implementation, this would download the actual PDF
        // For now, we'll just show a success message
        toast({
          title: "Download Started",
          description: "Certificate download has been initiated",
        })
        fetchCertificates() // Refresh to update download count
        onCertificateAction?.()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to download certificate")
      }
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message || "Please try again later",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued':
        return 'bg-blue-100 text-blue-800'
      case 'downloaded':
        return 'bg-green-100 text-green-800'
      case 'revoked':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'issued':
        return <Clock className="h-4 w-4" />
      case 'downloaded':
        return <CheckCircle className="h-4 w-4" />
      case 'revoked':
        return <FileText className="h-4 w-4" />
      default:
        return <Award className="h-4 w-4" />
    }
  }

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.certificateId.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading certificates...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          My Certificates
        </CardTitle>
        <p className="text-sm text-gray-600">
          View and download your event certificates
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="issued">Issued</SelectItem>
              <SelectItem value="downloaded">Downloaded</SelectItem>
              <SelectItem value="revoked">Revoked</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Certificates List */}
        {filteredCertificates.length === 0 ? (
          <div className="text-center py-8">
            <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? "No certificates match your search criteria" 
                : "You don't have any certificates yet. Complete events to earn certificates!"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCertificates.map((certificate) => (
              <div
                key={certificate._id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{certificate.eventTitle}</h4>
                      <Badge className={getStatusColor(certificate.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(certificate.status)}
                          {certificate.status}
                        </div>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Issued by {certificate.issuedByName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Certificate ID: {certificate.certificateId}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>Issued: {new Date(certificate.issuedAt).toLocaleDateString()}</p>
                    {certificate.metadata?.eventDate && (
                      <p>Event: {new Date(certificate.metadata.eventDate).toLocaleDateString()}</p>
                    )}
                    {certificate.downloadCount > 0 && (
                      <p>Downloads: {certificate.downloadCount}</p>
                    )}
                  </div>
                </div>

                {certificate.metadata?.eventVenue && (
                  <div className="text-sm text-gray-600 mb-3">
                    <p><strong>Venue:</strong> {certificate.metadata.eventVenue}</p>
                    {certificate.metadata.eventCategory && (
                      <p><strong>Category:</strong> {certificate.metadata.eventCategory}</p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {certificate.lastDownloadedAt && (
                      <p>Last downloaded: {new Date(certificate.lastDownloadedAt).toLocaleDateString()}</p>
                    )}
                    {certificate.verificationCode && (
                      <p>Verification code: {certificate.verificationCode}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadCertificate(certificate._id!)}
                      disabled={certificate.status === 'revoked'}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/certificates/verify?code=${certificate.verificationCode}`, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Verify
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
