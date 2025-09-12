"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>({})

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
        })
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

  const buildPayload = () => {
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
    return payload
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    try {
      const body = buildPayload()
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
