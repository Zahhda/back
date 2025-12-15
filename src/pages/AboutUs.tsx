import React, { useEffect, useState, useRef } from "react";
import { Container, Typography, CircularProgress, Box } from "@mui/material";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowUp, ShieldCheck, Timer, IndianRupee, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const testimonialsData = [...Array(5)].map((_, index) => ({
  id: index,
  name: `John Doe ${index + 1}`,
  location: "Tenant, Bangalore",
  img: `https://i.pravatar.cc/100?img=${index + 10}`,
  text:
    "The process was super smooth, and I found the perfect apartment within a day! DORPay is a game-changer.",
}));

const AboutUs = () => {

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const testimonialsPerPage = 3;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const res = await fetch("https://jsonplaceholder.typicode.com/users/1");
        const json = await res.json();
        setData(json);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch About Us data:", error);
        setLoading(false);
      }
    };

    fetchAboutData();

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentSlide((prev) =>
      Math.min(prev + 1, Math.ceil(testimonialsData.length / testimonialsPerPage) - 1)
    );
  };

  const visibleTestimonials = testimonialsData.slice(
    currentSlide * testimonialsPerPage,
    (currentSlide + 1) * testimonialsPerPage
  );

  return (
    <div className="overflow-x-hidden">
      <ThemeProvider defaultTheme="dark">
        <div className="min-h-screen flex flex-col relative">
          <Navbar />

          <main className="flex-grow pt-24 pb-12">

            {/* Hero Banner */}
           <section
  className="flex flex-col items-center justify-center text-center px-4 relative h-52 md:h-64 rounded-lg overflow-hidden mb-12 mx-3 sm:mx-12 bg-gradient-to-r from-gray-800/90 via-gray-900/90 to-gray-800/90 dark:bg-gradient-to-r dark:from-black/90 dark:via-black dark:to-black text-white p-4 sm:p-8"
>
  <div className="absolute inset-0 z-0 opacity-30">
    <svg
      className="absolute right-0 top-0 h-full w-full"
      viewBox="0 0 80 80"
      preserveAspectRatio="none"
    >
      <circle cx="0" cy="0" r="80" fill="white" fillOpacity="0.1" />
      <circle cx="80" cy="0" r="40" fill="white" fillOpacity="0.1" />
      <circle cx="80" cy="80" r="60" fill="white" fillOpacity="0.1" />
      <circle cx="0" cy="80" r="40" fill="white" fillOpacity="0.1" />
    </svg>
  </div>

  {/* Content */}
  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 sm:space-y-4 z-10">
    <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white animate-[fadeInDown_0.8s]">
      About Us
    </h1>
    <p className="text-xs sm:text-sm  md:text-xl drop-shadow-md max-w-2xl animate-fade-in-up delay-200">
      We connect people with the right properties, making buying, renting, or selling easy and transparent.
    </p>
    <Link to="/contact">
      <button className="px-5 py-2.5 md:px-6 md:py-3 bg-white hover:bg-white/90 text-black font-medium rounded-full shadow-md hover:shadow-lg transition animate-fade-in-up delay-400 dark:bg-primary dark:text-black dark:hover:bg-primary/90 text-sm md:text-base">
        Get in Touch
      </button>
    </Link>
  </div>
</section>




            {/* Adding animation styles */}
            <style>{`@keyframes fade-in{0%{opacity:0;}100%{opacity:1;}}@keyframes fade-in-up{0%{opacity:0;transform:translateY(20px);}100%{opacity:1;transform:translateY(0);}}.animate-fade-in{animation:fade-in 1.5s ease-in-out forwards;}.animate-fade-in-up{animation:fade-in-up 1s ease-in-out forwards;}.delay-200{animation-delay:200ms;}.delay-400{animation-delay:400ms;}`}</style>


            {/* About Content */}
<section className="w-full bg-gray-50 dark:bg-black py-12 md:py-16">
  <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-4 flex flex-col md:flex-row items-center md:items-center gap-8 md:gap-0">
    {/* Image */}
    <div className="flex items-center justify-center w-full md:w-1/2">
      <img
        src="/bighouse.png"
        alt="Happy Homes"
        className="w-40 sm:w-60 md:w-96 mb-4 md:mb-0 md:-ml-8"
      />
    </div>

    {/* Text */}
    <div className="w-full md:w-1/2 text-center md:text-left px-1">
      <p className="text-xs sm:text-sm uppercase text-black dark:text-white mb-2 sm:mb-3 md:mb-4 tracking-widest">
        Solving a common problem
      </p>
      <h2 className="text-lg sm:text-2xl md:text-5xl font-bold dark:text-white mb-3 sm:mb-4 md:mb-8 leading-snug">
        Finding a home <br className="hidden md:block" /> in the city
      </h2>
      <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-white leading-relaxed">
        At DORPay, you’re not just renting a place — you’re curating a lifestyle that reflects you.
        With diverse housing options and seamless support, we go beyond the ordinary to ensure
        hassle-free living every step of the way. Because at DORPay, it’s more than a home — it’s
        your way of life.
      </p>
    </div>
  </div>
</section>




            {/* Feature Cards with Motion */}
           <section className="py-12 md:py-16 px-3 sm:px-4 dark:bg-black">
  <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
    {[
      { icon: <ShieldCheck size={32} />, title: "Verified Listings", desc: "All properties are verified for authenticity." },
      { icon: <Timer size={32} />,        title: "Quick Support",    desc: "24/7 assistance for all your rental queries." },
      { icon: <IndianRupee size={32} />,  title: "Affordable Pricing",desc: "Competitive pricing with no hidden costs." },
      { icon: <Users size={32} />,         title: "Community Living", desc: "Connect with like-minded individuals." },
    ].map((feature, index) => (
      <motion.div
        key={index}
        className="bg-gray-100 dark:bg-gradient-to-br dark:from-black dark:via-[#0f0f0f] dark:to-black p-4 sm:p-5 md:p-6 rounded-xl shadow-md text-center transition-shadow "
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05, y: -5 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <motion.div
          className="mb-3 sm:mb-4 flex justify-center text-black dark:text-white"
          whileHover={{ scale: 1.3, rotate: 10 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {feature.icon}
        </motion.div>
        <h3 className="text-base sm:text-lg md:text-lg font-semibold mb-1.5 sm:mb-2 text-black dark:text-white">
          {feature.title}
        </h3>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">
          {feature.desc}
        </p>
      </motion.div>
    ))}
  </div>
</section>

            {/* 3rd-block */}
     <section className="bg-white dark:bg-gradient-to-br dark:from-black dark:via-[#0f0f0f] dark:to-black py-4 md:py-0 px-3 md:px-2">
  <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
    {/* Text Content */}
    <div className="text-center md:text-left pl-2 sm:pl-4 md:pl-12">
      <h1 className="text-lg sm:text-2xl md:text-5xl font-bold text-black dark:text-white mb-2 sm:mb-3 md:mb-4 md:whitespace-nowrap leading-snug">
        Discover Your Dream Home
      </h1>

      <h3 className="text-sm sm:text-base md:text-xl text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 md:mb-4">
        Comfortable Living. Hassle-Free Renting.
      </h3>

      <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-5 md:mb-6 leading-relaxed">
        With DORPay, experience the easiest way to rent fully furnished homes
        with complete transparency, zero brokerage, and instant support.
      </p>

      <button className="bg-black text-white dark:bg-white dark:text-black px-4 sm:px-5 md:px-6 py-2 md:py-3 rounded-lg hover:opacity-80 transition text-xs sm:text-sm md:text-base">
        Explore Listings
      </button>
    </div>

    {/* Image */}
    <div className="flex justify-center">
      <motion.img
        src="/house2.png"
        alt="Dream Home"
        className="w-44 sm:w-60 md:w-full max-w-[280px] sm:max-w-[340px] md:max-w-[500px] rounded-xl shadow-lg"
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300 }}
      />
    </div>
  </div>
</section>


            {/* Our Mission & Vision Section */}
         <section className="dark:bg-black bg-white py-14 md:py-20 px-4 md:px-6">
  <div className="max-w-6xl mx-auto">
    <div className="text-center mb-12 md:mb-16">
      <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-800 dark:text-white mb-3 md:mb-4">
        Our Mission & Vision
      </h2>
      <p className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
        At DORPay, we're committed to simplifying urban living by offering accessible, affordable, and trusted rental experiences.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
      {/* Mission */}
      <div className="bg-white dark:bg-gradient-to-br dark:from-black dark:via-[#0f0f0f] dark:to-black p-6 md:p-8 rounded-3xl shadow-2xl hover:shadow-xl transition duration-300">
        <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
          <div className="bg-blue-100 dark:bg-blue-900 p-2.5 md:p-3 rounded-full">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 dark:text-white">Our Mission</h3>
        </div>
        <p className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300">
          To revolutionize the way people find homes by providing transparent, tech-enabled solutions that eliminate broker hassles and bring ease to every tenant and landlord.
        </p>
      </div>

      {/* Vision */}
      <div className="bg-white dark:bg-gradient-to-br dark:from-black dark:via-[#0f0f0f] dark:to-black p-6 md:p-8 rounded-3xl shadow-2xl hover:shadow-xl transition duration-300">
        <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
          <div className="bg-green-100 dark:bg-green-900 p-2.5 md:p-3 rounded-full">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 12h18M12 3v18" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 dark:text-white">Our Vision</h3>
        </div>
        <p className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300">
          To become India’s most trusted digital housing partner, making rental living seamless, joyful, and reliable — one city at a time.
        </p>
      </div>
    </div>
  </div>
</section>


            {/* How It Works Section */}
            <section className="bg-gray-100 dark:bg-black py-14 md:py-20 px-4 md:px-6">
  <div className="max-w-6xl mx-auto text-center mb-12 md:mb-16">
    <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-800 dark:text-white mb-3 md:mb-4">
      How It Works
    </h2>
    <p className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
      Get started in just a few simple steps and move into your dream home stress-free.
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10 max-w-6xl mx-auto">
    {[
      {
        icon: (
          <svg className="w-10 h-10 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
        ),
        title: "Browse Listings",
        desc: "Explore a wide range of fully-furnished rental properties based on your budget and lifestyle.",
      },
      {
        icon: (
          <svg className="w-10 h-10 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 20l9-5-9-5-9 5 9 5z" />
            <path d="M12 12V4l8 4-8 4z" />
          </svg>
        ),
        title: "Book a Visit",
        desc: "Schedule a property visit online at your convenience. No brokers. No pressure.",
      },
      {
        icon: (
          <svg className="w-10 h-10 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" />
          </svg>
        ),
        title: "Move In",
        desc: "Complete the documentation online and move into your new home. It’s that simple!",
      },
    ].map((step, i) => (
      <motion.div
        key={i}
        className="bg-white dark:bg-gradient-to-br dark:from-black dark:via-[#0f0f0f] dark:to-black p-5 sm:p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.2 }}
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="text-primary text-3xl sm:text-4xl mb-3 sm:mb-4">{step.icon}</div>
        <h3 className="text-s sm:text-xl md:text-xl font-semibold text-gray-800 dark:text-white mb-2">
          {step.title}
        </h3>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">
          {step.desc}
        </p>
      </motion.div>
    ))}
  </div>
</section>


            {/* Testimonials Slider */}
            {/* <section className="bg-gray-100 dark:bg-gradient-to-br dark:from-black dark:via-[#0f0f0f] dark:to-black py-16 px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-white mb-12">
                What Our Tenants Say
              </h2>

              <div className="relative">
                <div className="flex justify-center">
                  <div
                    className="flex gap-6 transition-transform duration-500 ease-in-out"
                    ref={scrollRef}
                    aria-live="polite"
                  >
                    {visibleTestimonials.map((testimonial) => (
                      <motion.div
                        key={testimonial.id}
                        className="bg-white dark:bg-black p-6 rounded-lg shadow-md flex flex-col items-center text-center flex-shrink-0 w-full sm:w-80"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <img
                          src={testimonial.img}
                          alt={testimonial.name}
                          className="w-20 h-20 rounded-full mb-4 object-cover"
                        />
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                          "{testimonial.text}"
                        </p>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {testimonial.name}
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400">
                          {testimonial.location}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handlePrev}
                  disabled={currentSlide === 0}
                  aria-label="Previous testimonials"
                  className="absolute top-1/2 left-0 -translate-y-1/2 bg-white dark:bg-gray-700 rounded-full p-2 shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={handleNext}
                  disabled={
                    currentSlide ===
                    Math.ceil(testimonialsData.length / testimonialsPerPage) - 1
                  }
                  aria-label="Next testimonials"
                  className="absolute top-1/2 right-0 -translate-y-1/2 bg-white dark:bg-gray-700 rounded-full p-2 shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </section> */}

          </main>
          {/*footer*/}
          <footer className="bg-background py-12 px-6 md:px-12 border-t border-border">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <img src="/newlogo.png" alt="DORPay Logo" className="w-16 h-16" />

                {/* <h3 className="text-2xl font-semibold mb-4">
                  DORPay<span className="text-primary/80">.</span>
                </h3> */}
                <p className="text-muted-foreground max-w-md mb-6">
                  Discover the perfect property that matches your lifestyle and
                  preferences with our curated selection of premium DORPay.
                </p>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Twitter
                  </a>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Facebook
                  </a>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Instagram
                  </a>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4">Explore</h4>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Properties
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Agents
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Locations
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Blog
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-4">Contact</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Rsoultek Consulting India Pvt Ltd,</li>
                  <li>
                    CoWrks, RMZ Ecoworld, Ground Floor Bay Area, 6A,
                    Devarabisanahalli,
                  </li>
                  <li>Bengaluru, Karnataka, India- 560103</li>
                  <li>
                    <a
                      href="mailto:support@dorpay.in"
                      className="hover:text-foreground transition-colors"
                    >
                      support@dorpay.in
                    </a>
                  </li>
                  <li>
                    <a
                      href="tel:+919844809969"
                      className="hover:text-foreground transition-colors"
                    >
                      +91 9844809969
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-border text-center sm:text-left sm:flex sm:justify-between sm:items-center">
              <p className="text-muted-foreground text-sm">
                © {new Date().getFullYear()} DORPay. All rights reserved.
              </p>
              <div className="mt-4 sm:mt-0 flex justify-center sm:justify-end space-x-6 text-sm">
                <a
                  href="/privacy-policy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="/TermsConditions"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cookies Policy
                </a>
              </div>
            </div>

          </footer>


          {/* Back to Top Button */}
          {showBackToTop && (
            <button
              onClick={scrollToTop}
              aria-label="Back to top"
              className="fixed bottom-6 right-6 bg-black dark:bg-white text-white dark:text-black p-3 rounded-full shadow-lg hover:opacity-80 transition"
            >
              <ArrowUp size={24} />
            </button>
          )}
        </div>
      </ThemeProvider>
    </div>
  );
};

export default AboutUs;
