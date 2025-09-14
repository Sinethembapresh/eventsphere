import { Facebook, Instagram, MapPin, Mail, Twitter, Linkedin } from "lucide-react"
import Link from "next/link"

export function Footer() {
  const shareUrl = encodeURIComponent("https://eventsphere.com") // replace with your real URL
  const shareText = encodeURIComponent("Check out EventSphere! 🎉")

  return (
    <footer className="bg-gray-900 text-white py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Location */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Visit Us</h3>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4" />
            <a
              href="https://www.google.com/maps/dir//F8PP%2BQF3+Royal+Science+%26+Technology+Park(IT+Site),+Matsapha,+Eswatini/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-400 transition underline"
            >
              Royal Science & Technology Park, Matsapha, Eswatini
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-pink-300 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/events" className="hover:text-pink-300 transition-colors">
                Events
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-pink-300 transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link href="/auth/login" className="hover:text-pink-300 transition-colors">
                Login
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Contact Us</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center space-x-2">
              <Mail size={16} />
              <span>info@asit.edu</span>
            </li>
            <li>ASIT Campus, Eswatini</li>
            <li>P.O. Box 2316, Matsapha</li>
            <li>Tel: +26879302966</li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Newsletter</h3>
          <p className="text-sm text-white/80">
            Subscribe to stay updated with latest events and opportunities.
          </p>
          <form className="flex flex-col space-y-2">
            <input
              type="email"
              placeholder="Your email"
              className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-white"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-white text-blue-600 hover:bg-pink-100 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-12 pt-8 border-t border-white/20 text-sm text-center text-white/80">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
          <p>© {new Date().getFullYear()} EventSphere. All rights reserved. Designed by InnovateX</p>

          {/* Social + Sharing */}
          <div className="flex gap-4">
            {/* Normal socials */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-white hover:text-pink-400 transition"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-white hover:text-pink-400 transition"
            >
              <Instagram className="w-5 h-5" />
            </a>

            {/* Share icons */}
            <a
              href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="text-white hover:text-green-400 transition"
            >
              <i className="fab fa-whatsapp text-lg"></i>
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="text-white hover:text-blue-400 transition"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-white hover:text-blue-300 transition"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href={`mailto:?subject=${shareText}&body=${shareUrl}`}
              aria-label="Email"
              className="text-white hover:text-yellow-400 transition"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
