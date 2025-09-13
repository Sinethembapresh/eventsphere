"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Award, Users, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Event } from "@/lib/models/Event"
import type { CertificateTemplate } from "@/lib/models/Certificate"

interface Participant {
  _id: string
  userId: string
  userName: string
  userEmail: string
  userDepartment: string
  status: 'registered' | 'attended' | 'cancelled' | 'no-show'
  registrationDate: string
  attendanceTime?: string
}

interface CertificateIssuanceProps {
  event: Event & { _id: string }
  onCertificatesIssued?: () => void
}

export function CertificateIssuance({ event, onCertificatesIssued }: CertificateIssuanceProps) {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [criteria, setCriteria] = useState({
    attendanceRequired: true,
    paymentRequired: false
  })
  const [issuing, setIssuing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchTemplates()
    fetchParticipants()
  }, [event._id])

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
    }
  }

  const fetchParticipants = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/organizer/registrations?eventId=${event._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: "include"
      })

      if (response.ok) {
        const data = await response.json()
        setParticipants(data.registrations)
      }
    } catch (error) {
      console.error("Failed to fetch participants:", error)
    }
  }

  const handleParticipantToggle = (participantId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(participantId) 
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    )
  }

  const handleSelectAll = () => {
    const eligibleParticipants = participants.filter(p => 
      criteria.attendanceRequired ? p.status === 'attended' : p.status !== 'cancelled'
    )
    setSelectedParticipants(eligibleParticipants.map(p => p._id))
  }

  const handleDeselectAll = () => {
    setSelectedParticipants([])
  }

  const handleIssueCertificates = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Template Required",
        description: "Please select a certificate template",
        variant: "destructive"
      })
      return
    }

    if (selectedParticipants.length === 0) {
      toast({
        title: "Participants Required",
        description: "Please select at least one participant",
        variant: "destructive"
      })
      return
    }

    setIssuing(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch('/api/organizer/certificates/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId: event._id,
          templateId: selectedTemplate,
          participantIds: selectedParticipants,
          criteria
        }),
        credentials: "include"
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Certificates Issued",
          description: `Successfully issued ${data.certificates.length} certificates`,
        })
        
        setSelectedParticipants([])
        onCertificatesIssued?.()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to issue certificates")
      }
    } catch (error: any) {
      toast({
        title: "Issuance Failed",
        description: error.message || "Please try again later",
        variant: "destructive"
      })
    } finally {
      setIssuing(false)
    }
  }

  const eligibleParticipants = participants.filter(p => 
    criteria.attendanceRequired ? p.status === 'attended' : p.status !== 'cancelled'
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Issue Certificates
        </CardTitle>
        <p className="text-sm text-gray-600">
          Issue certificates to participants who attended and met the requirements
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Certificate Template *</label>
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger>
              <SelectValue placeholder="Select a certificate template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template._id} value={template._id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Criteria Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Eligibility Criteria</label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="attendanceRequired"
                checked={criteria.attendanceRequired}
                onCheckedChange={(checked) => 
                  setCriteria(prev => ({ ...prev, attendanceRequired: !!checked }))
                }
              />
              <label htmlFor="attendanceRequired" className="text-sm">
                Must have attended the event
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="paymentRequired"
                checked={criteria.paymentRequired}
                onCheckedChange={(checked) => 
                  setCriteria(prev => ({ ...prev, paymentRequired: !!checked }))
                }
              />
              <label htmlFor="paymentRequired" className="text-sm">
                Must have paid event fees
              </label>
            </div>
          </div>
        </div>

        {/* Participants Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Select Participants ({eligibleParticipants.length} eligible)
            </label>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={eligibleParticipants.length === 0}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                disabled={selectedParticipants.length === 0}
              >
                Deselect All
              </Button>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-3">
            {eligibleParticipants.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No eligible participants found</p>
              </div>
            ) : (
              eligibleParticipants.map((participant) => (
                <div
                  key={participant._id}
                  className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50"
                >
                  <Checkbox
                    id={participant._id}
                    checked={selectedParticipants.includes(participant._id)}
                    onCheckedChange={() => handleParticipantToggle(participant._id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{participant.userName}</p>
                      <Badge 
                        variant={participant.status === 'attended' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {participant.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{participant.userEmail}</p>
                    <p className="text-xs text-gray-400">{participant.userDepartment}</p>
                  </div>
                  <div className="text-right">
                    {participant.attendanceTime && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        Attended
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Issue Button */}
        <Button
          onClick={handleIssueCertificates}
          disabled={issuing || !selectedTemplate || selectedParticipants.length === 0}
          className="w-full"
        >
          {issuing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Issuing Certificates...
            </>
          ) : (
            <>
              <Award className="h-4 w-4 mr-2" />
              Issue {selectedParticipants.length} Certificate{selectedParticipants.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
