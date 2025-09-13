/**
 * Generate QR code data for event check-in
 * Format: "event:eventId:checkin:timestamp"
 */
export function generateEventQRCode(eventId: string): string {
  const timestamp = Date.now()
  return `event:${eventId}:checkin:${timestamp}`
}

/**
 * Parse QR code data to extract event information
 */
export function parseEventQRCode(qrData: string): {
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

  // Validate eventId is a valid MongoDB ObjectId (24 hex characters)
  const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(eventId)
  const isValidTimestamp = !isNaN(timestamp) && timestamp > 0

  return {
    eventId,
    timestamp,
    isValid: isValidObjectId && isValidTimestamp
  }
}

/**
 * Validate if QR code data is for event check-in
 */
export function isValidEventQRCode(qrData: string): boolean {
  const parsed = parseEventQRCode(qrData)
  return parsed.isValid
}

/**
 * Check if QR code is still valid (not expired)
 * QR codes are valid for 24 hours from generation
 */
export function isQRCodeExpired(qrData: string, maxAgeHours: number = 24): boolean {
  const parsed = parseEventQRCode(qrData)
  
  if (!parsed.isValid) return true
  
  const now = Date.now()
  const ageHours = (now - parsed.timestamp) / (1000 * 60 * 60)
  
  return ageHours > maxAgeHours
}