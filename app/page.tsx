import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Trophy, BookOpen, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 text-balance">
            Welcome to <span className="text-blue-600">EventSphere</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto text-pretty">
            Your comprehensive college event management system. Discover, participate, and organize amazing events that
            shape your college experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-3">
              <Link href="/events">
                Browse Events
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3 bg-transparent">
              <Link href="/auth/register">Join EventSphere</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need for College Events</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From technical workshops to cultural festivals, manage all your college events in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/events/past" className="hover:no-underline">
              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle>Past Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Browse and discover past events from all departments and categories.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link href="/events/register" className="hover:no-underline">
              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <CardTitle>Easy Registration</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Register for events with just a few clicks and manage your participation.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link href="/events/certificates" className="hover:no-underline">
              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <Trophy className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                  <CardTitle>Certificates</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Earn and download certificates for your participation and achievements.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link href="/events/manage" className="hover:no-underline">
              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <BookOpen className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <CardTitle>Event Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Organize and manage events with comprehensive tools for organizers.</CardDescription>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Event Categories</h2>
            <p className="text-lg text-gray-600">
              Explore events across various categories and find what interests you most.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Technical", color: "bg-purple-100 text-purple-800", count: "25+", path: "technical" },
              { name: "Cultural", color: "bg-pink-100 text-pink-800", count: "30+", path: "cultural" },
              { name: "Sports", color: "bg-orange-100 text-orange-800", count: "20+", path: "sports" },
              { name: "Academic", color: "bg-blue-100 text-blue-800", count: "15+", path: "academic" },
              { name: "Social", color: "bg-green-100 text-green-800", count: "10+", path: "social" },
              { name: "Career", color: "bg-indigo-100 text-indigo-800", count: "12+", path: "career" },
            ].map((category) => (
              <Link key={category.name} href={`/events/${category.path}`} className="hover:no-underline">
                <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${category.color} mb-2`}
                    >
                      {category.name}
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{category.count}</p>
                    <p className="text-sm text-gray-600">Events</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started? </h2>
              <p className="text-xl mb-8 text-blue-100">
                Join thousands of students already using EventSphere to enhance their college experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-3">
                  <Link href="/auth/register">Create Account</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
                >
                  <Link href="/events">Browse Events</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
