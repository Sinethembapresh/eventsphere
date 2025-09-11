import QRCode from "qrcode"
import { createHash } from "crypto"

export interface AttendanceData {
  eventId: string
  userId: string
  timestamp: number
  location?: string
}

export class QRCodeService {
  // Generate QR code for event attendance
  static async generateEventQR(eventId: string): Promise<string> {
    const attendanceUrl = `${process.env.NEXT_PUBLIC_APP_URL}/attendance/${eventId}`
    return await QRCode.toDataURL(attendanceUrl, {
      errorCorrectionLevel: "M",
      type: "image/png",
      quality: 0.92,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })
  }

  // Generate unique attendance token
  static generateAttendanceToken(eventId: string, userId: string): string {
    const data = `${eventId}-${userId}-${Date.now()}`
    return createHash("sha256").update(data).digest("hex").substring(0, 16)
  }

  // Verify attendance token
  static verifyAttendanceToken(token: string, eventId: string, userId: string): boolean {
    // In a real implementation, you'd store and verify tokens in the database
    return token.length === 16 && /^[a-f0-9]+$/.test(token)
  }

  // Generate certificate QR code
  static async generateCertificateQR(certificateId: string): Promise<string> {
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-certificate/${certificateId}`
    return await QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: "H",
      type: "image/png",
      quality: 0.95,
      margin: 2,
    })
  }
}
