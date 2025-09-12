"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

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
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    // Basic validation
    if (!form.title || !form.description || !form.category || !form.venue || !form.date || !form.time) {
      toast({ title: "Missing required fields", description: "Please fill in all required fields." })
      return
    }

    setSubmitting(true)
    try {
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
        registrationDeadline: form.registrationDeadline || form.date,
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
                  <Input id="date" type="date" name="date" value={form.date} onChange={handleChange} required />
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
