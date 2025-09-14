import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Facebook, Instagram, MapPin, Mail } from "lucide-react"
import { Header } from "@/components/layout/header"

export const metadata: Metadata = {
  title: 'eventsphere',
}

import RootLayoutWrapper from '@/components/RootLayoutWrapper';
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} min-h-screen bg-gradient-to-br from-pink-100 via-white to-blue-100`}>
        <AuthProvider>
          <RootLayoutWrapper>
            {children}
          </RootLayoutWrapper>
        </AuthProvider>
        {/* Dynamic Header Navigation - appears on all pages */}
        <Header />
        <div className="pt-20 min-h-screen flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          {/* Responsive Footer */}
          <footer className="w-full bg-white/80 border-t border-blue-100 py-6 mt-8">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col items-center md:items-start gap-2">
                <div className="text-lg font-bold bg-gradient-to-r from-blue-600 via-pink-500 to-blue-400 text-transparent bg-clip-text">EventSphere</div>
                <div className="flex items-center gap-2 text-blue-700 text-sm">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:info@eventsphere.com" className="hover:text-pink-500 transition">Contact Us</a>
                </div>
                <div className="flex items-center gap-2 text-blue-700 text-sm">
                  <MapPin className="w-4 h-4" />
                  <a
                    href="https://www.google.com/maps/place/Johannesburg,+South+Africa/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-pink-500 transition underline"
                  >
                    Johannesburg, Africa
                  </a>
                </div>
              </div>
              <div className="flex flex-col items-center md:items-end gap-2">
                <div className="flex gap-3 mb-1">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-blue-700 hover:text-pink-500 transition">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-blue-700 hover:text-pink-500 transition">
                    <Instagram className="w-5 h-5" />
                  </a>
                </div>
                <div className="text-xs text-gray-500 text-center md:text-right">&copy; {new Date().getFullYear()} EventSphere. All rights reserved. Designed By InnovateX</div>
              </div>
            </div>
          </footer>
        </div>
        <Analytics />
      </body>
    </html>
  )
}
