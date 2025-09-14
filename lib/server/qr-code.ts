import { ObjectId } from "mongodb"

/**
 * Server-side QR code utilities that use MongoDB ObjectId
 * These functions should only be used in API routes and server components
 */

/**
 * Generate QR code data for event check-in (server-side)
 * Format: "event:eventId:checkin:timestamp"
 */
export function generateEventQRCodeServer(eventId: string): string {
  const timestamp = Date.now()
  return `event:${eventId}:checkin:${timestamp}`
}

/**
 * Parse QR code data and validate with MongoDB ObjectId (server-side)
 */
export function parseEventQRCodeServer(qrData: string): {
  eventId: string
  timestamp: number
  isValid: boolean
} {
  const parts = qrData.split(':')
  
  if (parts.length !== 4 || parts[0] !== 'event' || parts[2] !== 'checkin') {
    return {
      eventId: '',
      timestamp: 0,
      isValid: false
    }
  }

  const eventId = parts[1]
  const timestamp = parseInt(parts[3])

  // Validate eventId is a valid MongoDB ObjectId
  const isValidObjectId = ObjectId.isValid(eventId)
  const isValidTimestamp = !isNaN(timestamp) && timestamp > 0

  return {
    eventId,
    timestamp,
    isValid: isValidObjectId && isValidTimestamp
  }
}

/**
 * Validate if QR code data is for event check-in (server-side)
 */
export function isValidEventQRCodeServer(qrData: string): boolean {
  const parsed = parseEventQRCodeServer(qrData)
  return parsed.isValid
}

/**
 * Check if QR code is still valid (not expired) (server-side)
 * QR codes are valid for 24 hours from generation
 */
export function isQRCodeExpiredServer(qrData: string, maxAgeHours: number = 24): boolean {
  const parsed = parseEventQRCodeServer(qrData)
  
  if (!parsed.isValid) return true
  
  const now = Date.now()
  const ageHours = (now - parsed.timestamp) / (1000 * 60 * 60)
  
  return ageHours > maxAgeHours
}
