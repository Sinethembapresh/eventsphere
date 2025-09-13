"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Award, 
  Search, 
  ExternalLink,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"

export default function CertificatesPage() {
  const [verificationCode, setVerificationCode] = useState("")
  const [certificateId, setCertificateId] = useState("")

  const handleVerify = () => {
    if (verificationCode.trim()) {
      window.open(`/certificates/verify?code=${verificationCode}`, '_blank')
    } else if (certificateId.trim()) {
      window.open(`/certificates/verify?id=${certificateId}`, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Certificate Verification</h1>
          <p className="text-xl text-gray-600 mb-8">
            Verify the authenticity of event certificates issued through EventSphere
          </p>
        </div>

        {/* Verification Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center justify-center">
              <Search className="h-6 w-6" />
              Verify Certificate
            </CardTitle>
            <p className="text-center text-gray-600">
              Enter either the verification code or certificate ID to verify a certificate
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Verification Code</label>
                <Input
                  placeholder="Enter 8-character verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={8}
                  className="text-center text-lg tracking-widest"
                />
              </div>
              
              <div className="text-center text-sm text-gray-500 font-medium">OR</div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Certificate ID</label>
                <Input
                  placeholder="Enter certificate ID"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  className="text-center"
                />
              </div>
            </div>

            <Button 
              onClick={handleVerify}
              disabled={(!verificationCode.trim() && !certificateId.trim())}
              className="w-full"
              size="lg"
            >
              <Search className="h-5 w-5 mr-2" />
              Verify Certificate
            </Button>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Authentic Certificates</h3>
              <p className="text-gray-600 text-sm">
                All certificates are cryptographically verified and tamper-proof
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Award className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Event Participation</h3>
              <p className="text-gray-600 text-sm">
                Certificates are issued for genuine event participation and attendance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Fraud Prevention</h3>
              <p className="text-gray-600 text-sm">
                Built-in verification prevents certificate forgery and misuse
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">How Certificate Verification Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold mb-2">Enter Verification Code</h3>
                <p className="text-sm text-gray-600">
                  Use the 8-character verification code provided on the certificate
                </p>
              </div>

              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold mb-2">Instant Verification</h3>
                <p className="text-sm text-gray-600">
                  Our system instantly verifies the certificate's authenticity
                </p>
              </div>

              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold mb-2">View Details</h3>
                <p className="text-sm text-gray-600">
                  See participant, event, and issuer information for verification
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-500 mb-4">
            Need help? Contact the event organizer or support team
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link href="/events">
                Browse Events
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                My Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
