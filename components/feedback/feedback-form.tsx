"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Star, MessageSquare, Send, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { EventFeedback } from "@/lib/models/Feedback"

interface FeedbackFormProps {
  eventId: string
  eventTitle: string
  onFeedbackSubmitted?: () => void
  onCancel?: () => void
}

export function FeedbackForm({ eventId, eventTitle, onFeedbackSubmitted, onCancel }: FeedbackFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [categories, setCategories] = useState({
    organization: 0,
    content: 0,
    venue: 0,
    overall: 0
  })
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleRatingChange = (newRating: number) => {
    setRating(newRating)
    // Set all categories to the same rating by default
    setCategories({
      organization: newRating,
      content: newRating,
      venue: newRating,
      overall: newRating
    })
  }

  const handleCategoryRatingChange = (category: keyof typeof categories, newRating: number) => {
    setCategories(prev => ({
      ...prev,
      [category]: newRating
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting feedback",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to submit feedback",
          variant: "destructive"
        })
        return
      }

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          eventId,
          rating,
          comment: comment.trim(),
          categories,
          isAnonymous
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        toast({
          title: "Feedback Submitted",
          description: "Thank you for your feedback!",
        })
        onFeedbackSubmitted?.()
      } else {
        const errorData = await response.json()
        toast({
          title: "Submission Failed",
          description: errorData.error || "Failed to submit feedback",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (currentRating: number, onRatingChange: (rating: number) => void, hovered: number = 0) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none"
            onClick={() => onRatingChange(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= (hovered || currentRating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-semibold text-green-600">Feedback Submitted!</h3>
            <p className="text-gray-600">
              Thank you for your feedback. Your input helps us improve future events.
            </p>
            <Button onClick={onCancel} variant="outline">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Event Feedback
        </CardTitle>
        <p className="text-sm text-gray-600">
          Share your experience with "{eventTitle}"
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Overall Rating *</Label>
            <div className="flex items-center gap-2">
              {renderStars(rating, handleRatingChange, hoveredRating)}
              <span className="text-sm text-gray-600 ml-2">
                {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select rating'}
              </span>
            </div>
          </div>

          {/* Detailed Categories */}
          {rating > 0 && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium text-gray-900">Rate Specific Aspects</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Organization</Label>
                  {renderStars(categories.organization, (rating) => handleCategoryRatingChange('organization', rating))}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Content Quality</Label>
                  {renderStars(categories.content, (rating) => handleCategoryRatingChange('content', rating))}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Venue & Facilities</Label>
                  {renderStars(categories.venue, (rating) => handleCategoryRatingChange('venue', rating))}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Overall Experience</Label>
                  {renderStars(categories.overall, (rating) => handleCategoryRatingChange('overall', rating))}
                </div>
              </div>
            </div>
          )}

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Additional Comments</Label>
            <Textarea
              id="comment"
              placeholder="Share any additional thoughts about the event..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center space-x-2">
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
            <Label htmlFor="anonymous" className="text-sm">
              Submit feedback anonymously
            </Label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}