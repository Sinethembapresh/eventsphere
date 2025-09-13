"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export function useAutoJoinEvent(eventId: string) {
  const [isAttemptingJoin, setIsAttemptingJoin] = useState(false)
  const [hasAttemptedJoin, setHasAttemptedJoin] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const checkForAutoJoin = async () => {
      // Check if this is a redirect from login
      const isFromLogin = searchParams.get("from") === "login"
      const hasPendingJoin = localStorage.getItem("pendingEventJoin") === eventId
      
      if ((isFromLogin || hasPendingJoin) && !hasAttemptedJoin) {
        setHasAttemptedJoin(true)
        setIsAttemptingJoin(true)
        
        // Clear the pending join
        localStorage.removeItem("pendingEventJoin")
        
        try {
          const token = localStorage.getItem("token")
          if (!token) {
            toast({
              title: "Authentication required",
              description: "Please log in to join this event",
              variant: "destructive"
            })
            return
          }

          const response = await fetch(`/api/events/${eventId}/register`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          })

          if (response.ok) {
            toast({
              title: "Successfully joined!",
              description: "You have been registered for this event",
            })
            // Refresh the page to update the UI
            window.location.reload()
          } else if (response.status === 400) {
            const data = await response.json()
            toast({
              title: "Cannot join event",
              description: data.error || "You may already be registered or the event is full",
              variant: "destructive"
            })
          } else if (response.status === 401) {
            toast({
              title: "Authentication expired",
              description: "Please log in again",
              variant: "destructive"
            })
            router.push("/auth/login")
          } else if (response.status === 403) {
            toast({
              title: "Not allowed",
              description: "Only participants can join events",
              variant: "destructive"
            })
          } else {
            toast({
              title: "Failed to join",
              description: "Please try again",
              variant: "destructive"
            })
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to join event. Please try again.",
            variant: "destructive"
          })
        } finally {
          setIsAttemptingJoin(false)
        }
      }
    }

    checkForAutoJoin()
  }, [eventId, searchParams, hasAttemptedJoin, router, toast])

  return { isAttemptingJoin, hasAttemptedJoin }
}
