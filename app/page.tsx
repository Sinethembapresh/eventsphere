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
import { Calendar, Users, Trophy, BookOpen, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-blue-100">
      {/* Hero Section */}
      <section className="relative w-screen h-[100vh] flex items-center justify-center overflow-hidden p-0 m-0">
        {/* Sliding background images */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          {images.map((src, idx) => (
            <img
              key={src}
              src={src}
              alt="EventSphere background"
              className={`object-cover w-full h-full absolute top-0 left-0 transition-opacity duration-1000 ease-in-out ${
                current === idx ? "opacity-100 animate-slide-down" : "opacity-0"
              }`}
            />
          ))}
        </div>

        {/* Overlay Content */}
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.h1
            className="text-5xl md:text-7xl font-extrabold mb-6 text-white drop-shadow-2xl"
            style={{ willChange: "opacity, transform" }}
          >
            {"Welcome to EventSphere".split(" ").map((word, index) => (
              <motion.span
                key={index}
                className={index === 1 ? "text-blue-400" : ""}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.3 }}
              >
                {word + " "}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            className="text-2xl text-white mb-10 max-w-2xl mx-auto font-medium drop-shadow-lg"
            style={{ willChange: "opacity, transform" }}
          >
            {"Your comprehensive college event management system. Discover, participate, and organize amazing events that shape your college experience."
              .split(" ")
              .map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {word + " "}
                </motion.span>
              ))}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            style={{ willChange: "opacity, transform" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
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
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-pink-500 to-blue-400">
              Everything You Need for College Events
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Made with ❤️ at ASIT
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
                    Browse and discover past events from all departments and
                    categories.
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
                    Register for events with just a few clicks and manage your
                    participation.
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
        </div>
      </section>

      {/* Categories Section */}
      <section
        className="py-20 px-4 sm:px-8 lg:px-16 relative"
        style={{
          backgroundImage:
            "url(https://www.l-acoustics.com/wp-content/uploads/2024/02/la-ldlc-arena-3-1024x683.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
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
          <div className="grid grid-cols-3 grid-rows-2 gap-6">
            {[
              {
                name: "Technical",
                count: "25+",
                path: "technical",
                bg: "https://plus.unsplash.com/premium_photo-1682125090365-58de6dbf8143?fm=jpg&q=60&w=3000",
              },
              {
                name: "Cultural",
                count: "30+",
                path: "cultural",
                bg: "https://media-01.imu.nl/storage/ourplanetinmylens.com/21978/umhlanga-reed-dance-festival-eswatini-800x533-2.jpg",
              },
              {
                name: "Sports",
                count: "20+",
                path: "sports",
                bg: "https://www.shutterstock.com/image-photo/miniature-eswatini-national-flag-three-260nw-2644772217.jpg",
              },
              {
                name: "Academic",
                count: "15+",
                path: "academic",
                bg: "https://www.uneswa.ac.sz/wp-content/uploads/2024/10/UNESWA2024-135-scaled.jpg",
              },
              {
                name: "Social",
                count: "10+",
                path: "social",
                bg: "https://media.istockphoto.com/id/479977238/photo/table-setting-for-an-event-party-or-wedding-reception.jpg",
              },
              {
                name: "Career",
                count: "12+",
                path: "career",
                bg: "https://www.sanu.ac.sz/wp-content/uploads/2025/08/514338773_1341303268003071_7835536648484644585_n.jpg",
              },
            ].map((category) => (
              <Link
                key={category.name}
                href={`/events/${category.path}`}
                className="hover:no-underline"
              >
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <Card className="relative overflow-hidden text-center cursor-pointer h-full bg-transparent border-0">
                    <CardContent className="p-0 m-0 relative z-10 flex flex-col items-center justify-center min-h-[200px] h-full w-full overflow-hidden border-0">
                      <div className="absolute inset-0 w-full h-full z-0">
                        <motion.img
                          src={category.bg}
                          alt={category.name + " background"}
                          className="absolute inset-0 w-full h-full object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-white/90 text-gray-900 mb-2 relative z-10 shadow mt-6">
                        {category.name}
                      </div>
                      <p className="text-2xl font-bold text-white relative z-10 drop-shadow-lg">
                        {category.count}
                      </p>
                      <p className="text-sm text-white relative z-10 drop-shadow">
                        Events
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center bg-gradient-to-r from-blue-500 to-pink-500 text-white">
        <h2 className="text-4xl font-extrabold mb-6">
          Ready to Join EventSphere?
        </h2>
        <p className="text-lg mb-8">
          Discover, organize, and participate in college events like never
          before!
        </p>
        <Button
          asChild
          size="lg"
          className="text-lg px-10 py-4 bg-white text-blue-600 font-bold shadow-lg hover:bg-gray-100 transition-all"
        >
          <Link href="/auth/register">Get Started</Link>
        </Button>
      </section>
    </div>
  );
}
