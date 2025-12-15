
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import { Link, useNavigate } from 'react-router-dom';
import type { Property as ServiceProperty } from "@/services/propertyService";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { motion } from "framer-motion";
import { TicketPercent } from "lucide-react";
// import PropertyHero from "@/components/PropertyHero";
// import PropertyFilters from "@/components/PropertyFilters";
// import PropertyGrid from "@/components/PropertyGrid";
import { Suspense, lazy, useEffect, useState, useCallback } from "react";

const PropertyHero = lazy(() => import("@/components/PropertyHero"));
const PropertyFilters = lazy(() => import("@/components/PropertyFilters"));
const PropertyGrid = lazy(() => import("@/components/PropertyGrid"));

// import { useEffect, useState } from "react";
const BlockSkeleton = ({ h = "h-40" }: { h?: string }) => (
  <div className={`rounded-2xl bg-muted/30 animate-pulse ${h}`} />
);

const Index = () => {

  const [showBackToTop, setShowBackToTop] = useState(false);
  const [filtered, setFiltered] = useState<ServiceProperty[] | undefined>(undefined);
  const [filterLoading, setFilterLoading] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const handleHeroClear = () => {
    setFiltered(undefined);
    setFilterError(null);
    setFilterLoading(false);
    const el = document.querySelector('[data-prop-grid-anchor]');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.scrollTo({ top: document.getElementById("property-grid-top")?.offsetTop ?? 0, behavior: "smooth" });
  };
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen flex flex-col relative">
        <Navbar />

        <main className="flex-1">
          {/* <PropertyHero
            onResults={(rows) => setFiltered(rows)}
            onSearchingChange={(isLoading) => setFilterLoading(isLoading)}
            onError={(msg) => setFilterError(msg)}
            onClear={handleHeroClear}
          /> */}
          {/* <PropertyFilters
            onResults={(rows) => {
              setFiltered(rows);
            }}
            onSearchingChange={(isLoading) => setFilterLoading(isLoading)}
            onError={(msg) => setFilterError(msg)}
          /> */}
          {/* <div data-prop-grid-anchor /> */}
          {/* Grid: controlled when 'filtered' is defined */}
          {/* <PropertyGrid
            items={filtered}
            loading={filtered !== undefined ? filterLoading : undefined}
            error={filtered !== undefined ? filterError ?? undefined : undefined}
            title={filtered !== undefined ? "Search Results" : "Featured Properties"}
          /> */}

          <Suspense fallback={<BlockSkeleton h="h-64" />}>
            <PropertyHero
              onResults={(rows) => setFiltered(rows)}
              onSearchingChange={(isLoading) => setFilterLoading(isLoading)}
              onError={(msg) => setFilterError(msg)}
              onClear={handleHeroClear}
            />
          </Suspense>

          <Suspense fallback={<BlockSkeleton h="h-20" />}>
            <PropertyFilters
              onResults={(rows) => setFiltered(rows)}
              onSearchingChange={(isLoading) => setFilterLoading(isLoading)}
              onError={(msg) => setFilterError(msg)}
            />
          </Suspense>

          <div data-prop-grid-anchor />

          <Suspense fallback={<BlockSkeleton h="h-[60vh]" />}>
            <PropertyGrid
              items={filtered}
              loading={filtered !== undefined ? filterLoading : undefined}
              error={filtered !== undefined ? filterError ?? undefined : undefined}
              title={filtered !== undefined ? "Search Results" : "Featured Properties"}
            />
          </Suspense>




          {/* Get Discount On Rent Pay Section */}
          <section
            className="relative h-[60vh] md:h-[70vh] flex items-center bg-fixed bg-no-repeat bg-right bg-contain  bg-white dark:bg-black transition-colors"
            style={{ backgroundImage: "url('/rent1.png')" }}
          >
            <div className="absolute inset-0  bg-gray-200/70 dark:bg-black/70   sm:bg-gray-100/40 sm:dark:bg-black/50 ">
            </div>

            <div className="relative z-10 w-full">
              <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center md:items-start">
                <div className="w-full md:w-1/2 text-center md:text-left">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="mb-4"
                  >
                    <TicketPercent className="w-10 h-10 text-primary" />
                  </motion.div>
                  <h2 className="text-lg sm:text-xl md:text-4xl font-bold mb-4 text-black dark:text-white">
                    Get Discount On Rent Pay
                  </h2>

                  <p className="text-xs sm:text-sm md:text-base mb-6 leading-relaxed md:max-w-[500px] text-gray-700 dark:text-gray-200 mx-auto md:mx-0">
                    Pay your rent through <span className="text-primary font-semibold">DORPay </span>
                    and unlock exclusive discounts and cashback every month.
                    Seamless, secure, and rewarding.
                  </p>

                  <Link to="/payrent" onClick={() => window.scrollTo(0, 0)}>
                    <Button
                      size="lg"
                      className="rounded-full px-6 py-3 shadow-md text-sm sm:text-base md:text-lg
               bg-primary text-white dark:text-black hover:bg-primary/90 transition-transform hover:scale-105"
                    >
                      Pay Rent &amp; Save
                    </Button>
                  </Link>

                </div>
              </div>
            </div>
          </section>


          {/* Why Use DOR Section */}
          <section className="py-0 sm:py-4 md:py-10 px-4 sm:px-6 md:px-12 bg-white dark:bg-background">
            <div className="max-w-7xl mx-auto text-center mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-lg sm:text-xl md:text-4xl font-bold text-black dark:text-white mb-2 sm:mb-3 md:mb-4">
                Why Use <span className="text-primary">DORPay</span>?
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                Discover the reasons why thousands trust DORPay for their home renting needs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {/* Item 1 */}
              <div className="flex flex-col items-center text-center p-4 sm:p-5 md:p-6 rounded-xl bg-muted/20 dark:bg-muted/30 group transition-transform transform hover:scale-105 hover:shadow-xl">
                <div className="animate-bounce mb-2 sm:mb-3 md:mb-4 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L3 10.25l1.5-1.5L9.75 14l10.5-10.5 1.5 1.5L9.75 17z" />
                  </svg>
                </div>
                <h3 className="text-s sm:text-xl font-semibold text-black dark:text-white mb-1 sm:mb-2">Zero Brokerage</h3>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Save big with our no-commission renting model.</p>
              </div>

              {/* Item 2 */}
              <div className="flex flex-col items-center text-center p-4 sm:p-5 md:p-6 rounded-xl bg-muted/20 dark:bg-muted/30 group transition-transform transform hover:scale-105 hover:shadow-xl">
                <div className="animate-bounce mb-2 sm:mb-3 md:mb-4 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zM12 14v7m0 0l-3.5-3.5M12 21l3.5-3.5" />
                  </svg>
                </div>
                <h3 className="text-s sm:text-xl font-semibold text-black dark:text-white mb-1 sm:mb-2">Instant Support</h3>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Need assistance? Our support team is just a message away.</p>
              </div>

              {/* Item 3 */}
              <div className="flex flex-col items-center text-center p-4 sm:p-5 md:p-6 rounded-xl bg-muted/20 dark:bg-muted/30 group transition-transform transform hover:scale-105 hover:shadow-xl">
                <div className="animate-bounce mb-2 sm:mb-3 md:mb-4 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-s sm:text-xl font-semibold text-black dark:text-white mb-1 sm:mb-2">Fully Furnished</h3>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Move-in ready homes with modern amenities.</p>
              </div>

              {/* Item 4 */}
              <div className="flex flex-col items-center text-center p-4 sm:p-5 md:p-6 rounded-xl bg-muted/20 dark:bg-muted/30 group transition-transform transform hover:scale-105 hover:shadow-xl">
                <div className="animate-bounce mb-2 sm:mb-3 md:mb-4 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h16v4H4V4zM4 12h16v4H4v-4zM4 20h16v-4H4v4z" />
                  </svg>
                </div>
                <h3 className="text-s sm:text-xl font-semibold text-black dark:text-white mb-1 sm:mb-2">Flexible Lease</h3>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Choose durations that suit your lifestyle.</p>
              </div>

            </div>
            <h3 className="text-center text-muted-foreground text-sm sm:text-base mt-6">
              Our team will reach out to guide you through your rental journey.
            </h3>

          </section>

          <section className="flex flex-col-reverse md:flex-row items-center justify-between gap-5 sm:gap-8 px-4 sm:px-6 md:px-12 py-6 sm:py-10 md:py-12 bg-muted/50 rounded-xl mt-6 sm:mt-10 md:mt-12 mx-auto max-w-7xl">
            {/* Left Text Block */}
            <div className="max-w-xl text-center md:text-left">
              <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-2.5 sm:mb-4">
                A lifestyle tailor-made for you
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                At DORPay, you’re not just renting a place — you’re curating a lifestyle that reflects you. With diverse housing options and seamless support, we go beyond the ordinary to ensure hassle-free living every step of the way. Because at DORPay, it’s more than a home — it’s your way of life.
              </p>
              <Link to="/about-us">
                <Button
                  size="lg"
                  className="rounded-full shadow-md text-xs sm:text-sm md:text-base px-4 py-2 sm:px-6 sm:py-3"
                >
                  Know About Us
                </Button>
              </Link>
            </div>

            {/* Right Image */}
            <div className="w-full md:w-1/2 lg:w-[650px]">
              <img
                src="/house.png"
                alt="Couple enjoying home lifestyle"
                className="w-full h-auto rounded-xl object-cover"
              />
            </div>
          </section>

          <section className="relative py-10 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 bg-muted/50">

            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-300/10 to-pink-200/10 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 rounded-xl blur-lg -z-10" />


            <div className="max-w-4xl mx-auto text-center bg-white/60 dark:bg-background/80 backdrop-blur-xl p-5 sm:p-8 md:p-10 rounded-3xl shadow-lg border border-muted transition hover:shadow-2xl">

              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-16 sm:h-16 mb-3 sm:mb-6 rounded-full bg-primary/20 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10l-6-6M3 14l6 6M8 8h8M8 16h8" />
                </svg>
              </div>


              <h2 className="text-lg sm:text-xl md:text-4xl font-bold mb-2.5 sm:mb-4 text-black dark:text-white">
                Ready to Rent or Sell Your Property?
              </h2>


              <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-4 sm:mb-6 max-w-2xl mx-auto">
                We simplify the process. Whether you're a builder or homeowner, our team helps you connect with the right audience. Start your journey with DORPay today!
              </p>


              <div className="flex justify-center gap-3 sm:gap-6 flex-wrap">
                <Link to="/contact">
                  <Button
                    size="lg"
                    className="px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm md:text-base font-medium
                     bg-black text-white hover:bg-gray-900
                     dark:bg-white dark:text-black dark:hover:bg-gray-100
                     transition-shadow shadow-md hover:shadow-lg"
                  >
                    Get Started
                  </Button>
                </Link>
                <Link to="/about-us">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm md:text-base  font-medium
                     border-black text-black hover:bg-black hover:text-white
                     dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black
                     hover:shadow-lg transition-all"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Footer section */}
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
                <ul className="space-y-0.2 sm:space-y-2 md:space-y-2">

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
        </main>

        {/* Back to top button */}
        {showBackToTop && (
          <Button
            variant="secondary"
            size="icon"
            className="fixed bottom-6 right-6 z-50 rounded-full opacity-80 hover:opacity-100 transition-opacity"
            onClick={scrollToTop}
          >
            <ArrowUp className="h-5 w-5" />
            <span className="sr-only">Back to top</span>
          </Button>
        )}
      </div>
    </ThemeProvider>
  );
};

export default Index;