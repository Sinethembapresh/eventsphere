"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Award, 
  CheckCircle, 
  XCircle, 
  Search, 
  Calendar, 
  MapPin, 
  User,
  FileText,
  AlertTriangle
} from "lucide-react"
import { useSearchParams } from "next/navigation"

interface CertificateVerification {
  valid: boolean
  certificate: {
    certificateId: string
    participantName: string
    eventTitle: string
    eventDate?: string
    eventVenue?: string
    issuedAt: string
    issuedBy: string
    status: string
    downloadCount: number
  }
}

export default function CertificateVerificationPage() {
  const [verificationCode, setVerificationCode] = useState("")
  const [certificateId, setCertificateId] = useState("")
  const [verification, setVerification] = useState<CertificateVerification | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if verification code is provided in URL
    const code = searchParams.get('code')
    const id = searchParams.get('id')
    
    if (code) {
      setVerificationCode(code)
      handleVerify('code', code)
    } else if (id) {
      setCertificateId(id)
      handleVerify('id', id)
    }
  }, [searchParams])

  const handleVerify = async (type: 'code' | 'id', value: string) => {
    if (!value.trim()) {
      setError("Please enter a verification code or certificate ID")
      return
    }

    setLoading(true)
    setError("")
    setVerification(null)

    try {
      const params = new URLSearchParams()
      if (type === 'code') {
        params.append('code', value)
      } else {
        params.append('id', value)
      }

      const response = await fetch(`/api/certificates/verify?${params}`)
      const data = await response.json()

      if (response.ok) {
        setVerification(data)
      } else {
        setError(data.error || "Certificate not found")
      }
    } catch (error) {
      setError("Failed to verify certificate. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (verificationCode.trim()) {
      handleVerify('code', verificationCode)
    } else if (certificateId.trim()) {
      handleVerify('id', certificateId)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate Verification</h1>
          <p className="text-gray-600">
            Verify the authenticity of event certificates
          </p>
        </div>

        {/* Verification Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Verify Certificate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Verification Code</label>
                <Input
                  placeholder="Enter 8-character verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={8}
                />
              </div>
              
              <div className="text-center text-sm text-gray-500">OR</div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Certificate ID</label>
                <Input
                  placeholder="Enter certificate ID"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading || (!verificationCode.trim() && !certificateId.trim())}
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Verify Certificate
                  </>
                )}
              </Button>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verification Result */}
        {verification && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {verification.valid ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-700">Certificate Verified</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-red-700">Certificate Invalid</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {verification.valid ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">This certificate is authentic and valid</span>
                    </div>
                    <p className="text-sm text-green-600">
                      The certificate has been verified and is legitimate.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{verification.certificate.eventTitle}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>{verification.certificate.participantName}</span>
                    </div>
                    
                    {verification.certificate.eventDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{new Date(verification.certificate.eventDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {verification.certificate.eventVenue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{verification.certificate.eventVenue}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span>Issued by {verification.certificate.issuedBy}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Certificate ID:</span>
                        <p className="font-mono">{verification.certificate.certificateId}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Issued Date:</span>
                        <p>{new Date(verification.certificate.issuedAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <Badge className="ml-2 bg-green-100 text-green-800">
                          {verification.certificate.status}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-500">Downloads:</span>
                        <p>{verification.certificate.downloadCount}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700 mb-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">Certificate Not Found or Revoked</span>
                  </div>
                  <p className="text-sm text-red-600">
                    The certificate you're looking for could not be found or has been revoked.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
