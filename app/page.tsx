"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  Users,
  Trophy,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  // Sliding images for hero background
  const images = [
    "https://www.thetravelmagazine.net/wp-content/uploads/Woman-traditional-dance-1200x800.jpg",
    "https://swatipages.com/wp-content/uploads/classified-listing/2024/08/MB-4.jpg",
    "https://www.americanprogress.org/wp-content/uploads/sites/2/2021/06/GettyImages-902836580.jpg",
    "https://img.freepik.com/free-photo/study-group-african-people_23-2149156390.jpg?semt=ais_hybrid&w=740&q=80",
  ];
  const [current, setCurrent] = useState(0);

  // Animation mount state
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-blue-100">
      {/* Add padding top to offset fixed header */}
      <div className="pt-20">
        {/* Hero Section */}
        <section className="relative w-screen h-[100vh] flex items-center justify-center overflow-hidden p-0 m-0 pt-20">
          {/* Sliding background images */}
          <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
            {images.map((src, idx) => (
              <img
                key={src}
                src={src}
                alt="EventSphere background"
                className={`object-cover w-full h-full absolute top-0 left-0 rounded-full transition-opacity duration-1000 ease-in-out ${
                  current === idx ? "opacity-100 animate-slide-down" : "opacity-0"
                }`}
                style={{
                  zIndex: 1,
                  transitionProperty: "opacity",
                  background: "#fff",
                }}
              />
            ))}
          </div>
          <div className="max-w-5xl mx-auto text-center relative z-10 bg-white/70 rounded-xl p-8 shadow-lg">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-pink-500 to-blue-400 drop-shadow-lg">
              Welcome to EventSphere
            </h1>
            <p className="text-2xl text-gray-700 mb-10 max-w-2xl mx-auto font-medium">
              Your comprehensive college event management system. Discover,
              participate, and organize amazing events that shape your college
              experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="text-lg px-10 py-4 bg-gradient-to-r from-blue-500 to-pink-500 text-white shadow-lg hover:from-pink-500 hover:to-blue-500 transition-all"
              >
                <Link href="/events">
                  Find Events
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-lg px-10 py-4 border-2 border-pink-400 text-pink-600 hover:bg-pink-50 hover:border-blue-400 hover:text-blue-600 transition-all bg-white"
              >
                <Link href="/auth/register">Join EventSphere</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-r from-blue-50 via-pink-50 to-blue-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-blue-600 to-pink-400">
                Event Categories
              </h2>
              <p className="text-lg text-gray-600">
                Explore events across various categories and find what interests
                you most.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                {
                  name: "Technical",
                  color: "bg-purple-100 text-purple-800",
                  count: "25+",
                  path: "technical",
                  bg: "https://cdn-icons-png.flaticon.com/512/2721/2721296.png",
                },
                {
                  name: "Cultural",
                  color: "bg-pink-100 text-pink-800",
                  count: "30+",
                  path: "cultural",
                  bg: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
                },
                {
                  name: "Sports",
                  color: "bg-orange-100 text-orange-800",
                  count: "20+",
                  path: "sports",
                  bg: "https://cdn-icons-png.flaticon.com/512/1041/1041916.png",
                },
                {
                  name: "Academic",
                  color: "bg-blue-100 text-blue-800",
                  count: "15+",
                  path: "academic",
                  bg: "https://cdn-icons-png.flaticon.com/512/3135/3135755.png",
                },
                {
                  name: "Social",
                  color: "bg-green-100 text-green-800",
                  count: "10+",
                  path: "social",
                  bg: "https://cdn-icons-png.flaticon.com/512/1946/1946429.png",
                },
                {
                  name: "Career",
                  color: "bg-indigo-100 text-indigo-800",
                  count: "12+",
                  path: "career",
                  bg: "https://cdn-icons-png.flaticon.com/512/3135/3135789.png",
                },
              ].map((category) => (
                <Link
                  key={category.name}
                  href={`/events/${category.path}`}
                  className="hover:no-underline"
                >
                  <Card className="text-center hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden">
                    <CardContent className="p-6 relative z-10">
                      <div className="absolute inset-0 z-0 opacity-20 flex items-center justify-center pointer-events-none">
                        <img
                          src={category.bg}
                          alt={category.name + " icon"}
                          className="w-24 h-24 object-contain mx-auto"
                        />
                      </div>
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${category.color} mb-2 relative z-10 bg-white/80 backdrop-blur`}
                      >
                        {category.name}
                      </div>
                      <p className="text-2xl font-bold text-gray-900 relative z-10">
                        {category.count}
                      </p>
                      <p className="text-sm text-gray-600 relative z-10">
                        Events
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Certificates & Management */}
        <section className="py-20 px-4 sm:px-8 lg:px-16">
          <div className="max-w-4xl mx-auto text-center grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/events/certificates" className="hover:no-underline">
              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <Trophy className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                  <CardTitle>Certificates</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Earn and download certificates for your participation and
                    achievements.
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
                  <CardDescription>
                    Organize and manage events with comprehensive tools for
                    organizers.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 px-4 sm:px-8 lg:px-16">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-xl mb-8 text-blue-100">
                  Join thousands of students already using EventSphere to
                  enhance their college experience.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    variant="secondary"
                    className="text-lg px-10 py-4 bg-white text-pink-600 border-2 border-pink-400 hover:bg-pink-50 hover:text-blue-600 hover:border-blue-400 transition-all"
                  >
                    <Link href="/auth/register">Create Account</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="text-lg px-10 py-4 border-2 border-white text-white hover:bg-white hover:text-pink-600 hover:border-pink-400 bg-transparent transition-all"
                  >
                    <Link href="/events">Browse Events</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
