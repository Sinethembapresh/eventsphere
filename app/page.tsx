"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Calendar, Users, Trophy, BookOpen, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();

  const images = [
    "https://thumbs.dreamstime.com/b/crowd-hands-smartphones-music-festival-concert-large-crowd-music-festival-holds-up-smartphones-to-capture-392126047.jpg",
    "https://www.thetravelmagazine.net/wp-content/uploads/Woman-traditional-dance-1200x800.jpg",
    "https://swatipages.com/wp-content/uploads/classified-listing/2024/08/MB-4.jpg",
    "https://images.stockcake.com/public/2/5/f/25f3bbda-4f2a-4a50-bf23-196550a44740_large/vibrant-concert-fun-stockcake.jpg",
    "https://cdn.vectorstock.com/i/500p/23/44/stage-podium-with-purple-lights-vector-51112344.jpg",
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [images.length]);

  const categories = [
    { name: "Technical", count: "", path: "technical", bg: "https://plus.unsplash.com/premium_photo-1682125090365-58de6dbf8143?fm=jpg&q=60&w=3000" },
    { name: "Cultural", count: "", path: "cultural", bg: "https://media-01.imu.nl/storage/ourplanetinmylens.com/21978/umhlanga-reed-dance-festival-eswatini-800x533-2.jpg" },
    { name: "Sports", count: "", path: "sports", bg: "https://www.shutterstock.com/image-photo/miniature-eswatini-national-flag-three-260nw-2644772217.jpg" },
    { name: "Academic", count: "", path: "academic", bg: "https://www.uneswa.ac.sz/wp-content/uploads/2024/10/UNESWA2024-135-scaled.jpg" },
    { name: "Social", count: "", path: "social", bg: "https://media.istockphoto.com/id/1049022558/photo/cheering-crowd-at-a-concert.jpg?s=612x612&w=0&k=20&c=N7i13NuEACX5XQtl3yxk_chY7QUiMYip-l_JNOYYXH0=" },
    { name: "Career", count: "", path: "career", bg: "https://www.sanu.ac.sz/wp-content/uploads/2025/08/514338773_1341303268003071_7835536648484644585_n.jpg" },
  ];

  const handleCategoryClick = (category: string) => {
    router.push(`/gallery?category=${category}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-blue-100">

      {/* Hero Section */}
      <section className="relative w-screen h-[100vh] flex items-center justify-center overflow-hidden p-0 m-0">
        {/* Sliding background images */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          {images.map((src, idx) => (
            <motion.img
              key={idx}
              src={src}
              alt="EventSphere background"
              className="object-cover w-full h-full absolute top-0 left-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: current === idx ? 1 : 0, y: current === idx ? 0 : 20 }}
              transition={{ duration: 1 }}
            />
          ))}
          <div className="absolute inset-0 bg-black/40 z-0"></div>
        </div>

        {/* Overlay Content */}
        <div className="max-w-5xl mx-auto text-center relative z-10 px-4">
          <motion.h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-white drop-shadow-2xl">
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

          <motion.p className="text-xl md:text-2xl text-white mb-10 max-w-2xl mx-auto font-medium drop-shadow-lg">
            {"Your comprehensive college event management system. Discover, participate, and organize amazing events that shape your college experience."
              .split(" ")
              .map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  {word + " "}
                </motion.span>
              ))}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <Button
              asChild
              size="lg"
              className="text-lg px-10 py-4 bg-gradient-to-r from-blue-500 to-pink-500 text-white shadow-lg hover:scale-105 hover:from-pink-500 hover:to-blue-500 transition-all duration-300"
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
              className="text-lg px-10 py-4 border-2 border-pink-400 text-pink-600 hover:bg-pink-50 hover:scale-105 hover:border-blue-400 hover:text-blue-600 transition-all duration-300 bg-white"
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
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Made with ❤️ at ASIT</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[{
              href: "/events/past",
              icon: Calendar,
              title: "Past Events",
              desc: "Browse past events from all departments and categories.",
              color: "text-blue-600"
            },{
              href: "/events/upcoming",
              icon: Users,
              title: "Upcoming Events",
              desc: "Stay updated with upcoming college events and never miss out.",
              color: "text-green-600"
            },{
              href: "/faqs",
              icon: BookOpen,
              title: "FAQs",
              desc: "Find answers to common questions about events and registration.",
              color: "text-purple-600"
            },{
              href: "/events/certificates",
              icon: Trophy,
              title: "Certificates",
              desc: "Download and verify certificates for the events you participated in.",
              color: "text-yellow-600"
            }].map((feature, idx) => (
              <Link key={idx} href={feature.href} className="hover:no-underline">
                <Card className="text-center hover:shadow-xl hover:scale-105 transition-all cursor-pointer">
                  <CardHeader>
                    <feature.icon className={`h-12 w-12 ${feature.color} mx-auto mb-4`} />
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.desc}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Event Categories Section */}
      <section
        className="py-20 px-4 sm:px-8 lg:px-16 relative"
        style={{
          backgroundImage: "url(https://images.stockcake.com/public/a/0/2/a020c87f-2bd8-4153-889b-fd4be3f9413b_large/neon-concert-crowd-stockcake.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-blue-600 to-pink-400">
              Event Categories
            </h2>
            <p className="text-lg text-gray-200">Explore events across various categories and find what interests you most.</p>
          </div>

          <div className="grid grid-cols-3 grid-rows-2 gap-6">
            {categories.map((category) => (
              <motion.div
                key={category.name}
                whileHover={{ scale: 1.05, rotate: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                onClick={() => handleCategoryClick(category.path)}
                className="cursor-pointer"
              >
                <Card className="relative overflow-hidden text-center h-64 rounded-xl shadow-lg bg-transparent border-0">
                  <CardContent className="p-0 m-0 relative z-10 flex flex-col items-center justify-center h-full">
                    <div className="absolute inset-0 w-full h-full z-0">
                      <motion.img
                        src={category.bg}
                        alt={category.name + " background"}
                        className="absolute inset-0 w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.4 }}
                      />
                      <div className="absolute inset-0 bg-black/30"></div>
                    </div>
                    <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-white/90 text-gray-900 mb-2 relative z-10 shadow mt-6">
                      {category.name}
                    </div>
                    <p className="text-2xl font-bold text-white relative z-10 drop-shadow-lg">{category.count}</p>
                    <p className="text-sm text-white relative z-10 drop-shadow">Events</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
