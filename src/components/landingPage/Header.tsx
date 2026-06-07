"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const nav = [
  { label: "Home", section: "hero" },
  { label: "About", section: "about" },
  { label: "Services", section: "services" },
  { label: "How It Works", section: "hiw" },
  { label: "Contact", section: "quote" },
];

function scrollTo(section: string) {
  const el = document.getElementById(section);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`px-6 py-4 fixed top-5 z-50 w-full transition-all duration-300 ${scrolled ? "top-0" : "top-5"}`}
    >
      <div
        className={`max-w-6xl mx-auto flex items-center justify-between rounded-xl px-6 py-3 transition-all duration-300 ${
          scrolled ? "bg-white/90 backdrop-blur-md shadow-md" : "bg-transparent"
        }`}
      >
        <button type="button" onClick={() => scrollTo("hero")} aria-label="Go to top" className="focus:outline-none">
          <Image src="/logo.svg" alt="Logical Links" width={100} height={50} />
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {nav.map((n) => (
            <button
              key={n.label}
              type="button"
              onClick={() => scrollTo(n.section)}
              className="text-sm font-medium text-muted hover:text-primary transition-colors"
            >
              {n.label}
            </button>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={() => scrollTo("quote")}
            className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-xs transition-colors"
          >
            Get a Quote
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden p-2 text-gray-700"
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
                onClick={() => { scrollTo(n.section); setOpen(false); }}
                className="text-sm font-medium text-gray-700 hover:text-primary transition-colors text-left"
              >
                {n.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { scrollTo("quote"); setOpen(false); }}
              className="mt-2 px-6 py-2 text-sm font-medium text-center text-white bg-primary hover:bg-primary-dark rounded-xs transition-colors"
            >
              Get a Quote
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
