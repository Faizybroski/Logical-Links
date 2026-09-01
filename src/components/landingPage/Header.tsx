"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuoteGate } from "@/hooks/use-quote-gate";

const nav = [
  { label: "Home", section: "hero" },
  { label: "About", section: "about" },
  { label: "Services", section: "services" },
  { label: "How It Works", section: "hiw" },
  { label: "Contact", section: "quote" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const requestQuote = useQuoteGate();

  const goToSection = (section: string) => {
    if (pathname === "/") {
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/#${section}`);
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      /* Floats with breathing room at the top of the page, then on scroll the
         top gap collapses to zero, the bar spans the full width and a solid
         backdrop fades in — all driven by the `scrolled` flag + CSS transitions. */
      className={`fixed left-0 right-0 z-50 w-full transition-all duration-500 ease-out ${
        scrolled ? "top-0 px-0 py-0" : "top-10 px-6 py-4"
      }`}
    >
      <div
        className={`mx-auto flex items-center justify-between transition-all duration-500 ease-out ${
          scrolled
            ? "max-w-full rounded-none px-6 py-4 lg:px-10 bg-white/95 backdrop-blur-md shadow-md"
            : "max-w-7xl rounded-xl px-6 py-3 bg-transparent"
        }`}
      >
        <button
          type="button"
          onClick={() => goToSection("hero")}
          aria-label="Go to top"
          className="focus:outline-none"
        >
          <Image src="/logo.svg" alt="Logical Links" width={100} height={50} />
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {nav.map((n) => (
            <button
              key={n.label}
              type="button"
              onClick={() => goToSection(n.section)}
              className="text-sm font-medium text-black hover:text-primary transition-colors"
            >
              {n.label}
            </button>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="/login"
            className="text-sm font-medium text-black hover:text-primary transition-colors"
          >
            Log In
          </a>
          <a
            href="/register"
            className="px-5 py-2 text-sm font-medium border border-primary text-white bg-primary hover:bg-primary-dark hover:text-white rounded-xs transition-colors"
          >
            Sign Up
          </a>
          <button
            type="button"
            onClick={() => requestQuote(() => goToSection("quote"))}
            className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-xs transition-colors"
          >
            Request a Quote
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden p-2 text-black"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mt-2 mx-4 rounded-xl bg-white/95 backdrop-blur-sm shadow-lg p-6 flex flex-col gap-4"
          >
            {nav.map((n) => (
              <button
                key={n.label}
                type="button"
                onClick={() => {
                  goToSection(n.section);
                  setOpen(false);
                }}
                className="text-sm font-medium text-black hover:text-primary transition-colors text-left"
              >
                {n.label}
              </button>
            ))}

            <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
              <a
                href="/login"
                onClick={() => setOpen(false)}
                className="flex-1 text-center text-sm font-medium text-black hover:text-primary transition-colors py-2"
              >
                Log In
              </a>
              <a
                href="/register"
                onClick={() => setOpen(false)}
                className="flex-1 text-center px-4 py-2 text-sm font-medium text-primary border border-primary hover:bg-primary hover:text-white rounded-xs transition-colors"
              >
                Sign Up
              </a>
            </div>

            <button
              type="button"
              onClick={() => {
                requestQuote(() => goToSection("quote"));
                setOpen(false);
              }}
              className="mt-2 px-6 py-2 text-sm font-medium text-center outline outline-primary outline-offset-2 text-white bg-primary hover:bg-primary-dark rounded-xs transition-colors"
            >
              Get a Quote
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
