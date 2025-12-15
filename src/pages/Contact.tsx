import React, { useState, useEffect } from 'react';
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import { ArrowUp } from "lucide-react";
import { MapPin, Mail, Phone } from "lucide-react";

const ContactUs = () => {
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 300);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <ThemeProvider>
            <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <Navbar />

                <main className="flex-grow pt-24 pb-12 bg-gradient-to-b from-transparent to-gray-100 dark:bg-gradient-to-br dark:from-black dark:via-[#0f0f0f] dark:to-black">
                    {/* Hero Banner with Gradient Background */}
                    <section
                        className="
    relative h-48 md:h-64 rounded-lg overflow-hidden mb-8 md:mb-12 mx-4 sm:mx-12
    bg-gradient-to-r from-gray-800/90 via-gray-900/90 to-gray-800/90
    dark:bg-gradient-to-r dark:from-black/80 dark:via-gray-800/80 dark:to-gray-700/80
    p-4 sm:p-6 md:p-8 flex flex-col justify-center items-center
  "
                    >
                        {/* Background pattern */}
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

                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 md:mb-4 text-center text-white">
                            Get in Touch
                        </h1>
                        <p className="text-xs sm:text-sm md:text-lg max-w-2xl mx-auto text-center text-white">
                            We're here to help and answer any question you might have.
                        </p>
                    </section>




                    <section className="flex-1">
                        <div className="py-2 px-2 md:px-20">
                            <div className="max-w-4xl mx-auto">

                                <div className="shadow-lg shadow-gray-300 dark:shadow-gray-800/40 p-4 sm:p-6 md:p-8 rounded-lg bg-white dark:bg-black grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                    {/* Contact Info */}
                                    <div className="space-y-5 sm:space-y-6">
                                        {/* Our Office */}
                                        <div className="flex items-start space-x-3">
                                            {/* Smaller icon on mobile, original on desktop */}
                                            <MapPin className="mt-0.5 w-10 h-10 md:w-16 md:h-16 text-primary" />
                                            <div>
                                                <h3 className="text-lg sm:text-xl font-semibold mb-1">Our Office</h3>
                                                <p className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300">
                                                    Rsoultek Consulting India Pvt Ltd, CoWrks, RMZ Ecoworld, Ground Floor Bay Area, 6A,
                                                    Devarabisanahalli, Bengaluru, Karnataka, India- 560103
                                                </p>
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="flex items-start space-x-3">
                                            <Mail className="mt-0.5 w-5 h-5 text-primary" />
                                            <div>
                                                <h3 className="text-lg sm:text-xl font-semibold mb-1">Email</h3>
                                                <p className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300">
                                                    <a href="mailto:support@dorpay.in" className="text-blue-600 dark:text-blue-400 hover:underline">
                                                        support@dorpay.in
                                                    </a>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Phone */}
                                        <div className="flex items-start space-x-3">
                                            <Phone className="mt-0.5 w-5 h-5 text-primary" />
                                            <div>
                                                <h3 className="text-lg sm:text-xl font-semibold mb-1">Phone</h3>
                                                <p className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300">+91 9844809969</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Form */}
                                    <form className="space-y-3 sm:space-y-4">
                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium">Name</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white rounded-md text-sm md:text-base"
                                                placeholder="Your Name"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium">Email</label>
                                            <input
                                                type="email"
                                                className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white rounded-md text-sm md:text-base"
                                                placeholder="you@example.com"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium">Subject</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white rounded-md text-sm md:text-base"
                                                placeholder="Subject"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium">Message</label>
                                            <textarea
                                                rows={4}
                                                className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white rounded-md text-sm md:text-base"
                                                placeholder="Your message..."
                                            ></textarea>
                                        </div>

                                        <button
                                            type="submit"
                                            className="text-xs sm:text-sm w-full md:w-auto bg-black dark:bg-white text-white dark:text-black px-5 md:px-6 py-2 rounded-md border border-black dark:border-white hover:opacity-90 transition"
                                        >
                                            Send Message
                                        </button>
                                    </form>
                                </div>

                            </div>
                        </div>
                    </section>

                </main>

                {/* Footer */}
                <footer className="bg-background py-12 px-6 md:px-12 border-t border-border">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="md:col-span-2">
                            <img src="/newlogo.png" alt="DORPay Logo" className="w-16 h-16" />

                            {/* <h3 className="text-2xl font-semibold mb-4">
                                    DORPay<span className="text-primary/80">.</span>
                                </h3> */}
                            <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-md mb-6">
                                Discover the perfect property that matches your lifestyle and preferences with our curated selection of premium DORPay.
                            </p>
                            <div className="flex space-x-4">
                                <a
                                    href="#"
                                    className=" text-xs sm:text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Twitter
                                </a>
                                <a
                                    href="#"
                                    className="text-xs sm:text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Facebook
                                </a>
                                <a
                                    href="#"
                                    className="text-xs sm:text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Instagram
                                </a>
                                <a
                                    href="#"
                                    className="text-xs sm:text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors"
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
                                        className="text-xs sm:text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Properties
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-xs sm:text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Agents
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-xs sm:text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Locations
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-xs sm:text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Blog
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-medium mb-4">Contact</h4>
                            <ul className="text-xs sm:text-sm md:text-base space-y-2 text-muted-foreground">
                                <li>Rsoultek Consulting India Pvt Ltd,</li>
                                <li>
                                    CoWrks, RMZ Ecoworld, Ground Floor Bay Area, 6A, Devarabisanahalli,
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
                        <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
                            © {new Date().getFullYear()} DORPay. All rights reserved.
                        </p>
                        <div className="mt-4 sm:mt-0 flex justify-center sm:justify-end space-x-6 text-sm">
                            <a
                                href="/privacy-policy"
                                className="text-xs sm:text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Privacy Policy
                            </a>
                            <a
                                href="/TermsConditions"
                                className="text-xs sm:text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Terms of Service
                            </a>
                            <a
                                href="#"
                                className="text-xs sm:text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Cookies Policy
                            </a>
                        </div>
                    </div>
                </footer>

                {/* Back to Top */}
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
    );
};

export default ContactUs;
