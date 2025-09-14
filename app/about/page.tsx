import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-pink-500 to-blue-400 text-transparent bg-clip-text mb-6">
            ASIT EventSphere
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your gateway to Advanced School of Information Technology's vibrant academic and social events ecosystem
          </p>
        </div>

        {/* About ASIT Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold text-gray-900">Welcome to ASIT</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Advanced School of Information Technology (ASIT) is a premier institution dedicated to nurturing 
                the next generation of tech leaders. Our EventSphere platform serves as the digital heart of 
                our campus life, bringing together academic excellence and community engagement.
              </p>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-pink-500/20" />
              <Image
                src="https://thumbs.dreamstime.com/b/vibrant-stage-pink-purple-lights-brightly-lit-stage-set-up-concert-performance-featuring-neon-pink-purple-389706224.jpg"
                alt="ASIT Events Stage"
                fill
                style={{ objectFit: 'cover' }}
                className="hover:opacity-90 transition-opacity"
              />
            </div>
          </div>
        </div>

        {/* Featured Events Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-center mb-12">Signature Events at ASIT</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Tech Innovation Summit</h3>
              <p className="text-gray-600">Annual showcase of student projects, industry partnerships, and breakthrough technologies.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Hackathons</h3>
              <p className="text-gray-600">Regular coding competitions and problem-solving challenges with industry mentors.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Tech Workshops</h3>
              <p className="text-gray-600">Hands-on learning sessions featuring emerging technologies and industry best practices.</p>
            </div>
          </div>
        </div>

        {/* Platform Features */}
        <div className="bg-gradient-to-r from-blue-50 to-pink-50 rounded-2xl p-8">
          <h2 className="text-3xl font-semibold text-center mb-12">Platform Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl">
              <h3 className="font-semibold text-lg mb-2">Real-time Updates</h3>
              <p className="text-gray-600">Stay informed with instant notifications about event changes and announcements.</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl">
              <h3 className="font-semibold text-lg mb-2">Easy Registration</h3>
              <p className="text-gray-600">One-click registration for all campus events with automated confirmations.</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl">
              <h3 className="font-semibold text-lg mb-2">Digital Certificates</h3>
              <p className="text-gray-600">Secure, verifiable certificates for workshop and event participation.</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl">
              <h3 className="font-semibold text-lg mb-2">Event Gallery</h3>
              <p className="text-gray-600">Comprehensive archive of past events with photos and highlights.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
