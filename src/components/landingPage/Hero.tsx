"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const HERO_TAGLINES = [
  "End-to-end logistics solutions designed to deliver efficiency, visibility, and control",
  "Real-time shipment tracking that keeps your team and customers informed at every step",
  "Streamlined freight management built to cut costs and eliminate delays",
  "Reliable nationwide delivery networks powered by smart route optimization",
  "Dedicated support and transparent reporting for total supply chain confidence",
];

const ROTATION_INTERVAL_MS = 3000;

function RotatingTagline() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_TAGLINES.length);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="relative block flex-1 h-24 sm:h-28 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {HERO_TAGLINES[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function Hero() {
  return (
    <section id="hero">
      <div className="max-w-6xl mx-auto pt-24 pb-20 text-start">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-3xl sm:text-6xl text-black font-bold leading-tight mb-6 uppercase"
        >
          Smart
          <br className="hidden sm:block" />{" "}
          <span className="text-primary">Logistics</span>
          <br className="hidden sm:block" /> built for
          <br className="hidden sm:block" /> performance
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="flex gap-5 text-base sm:text-xl font-medium text-gray-600 max-w-sm mb-10"
        >
          <Image
            className="self-start"
            src="/quote.svg"
            width={30}
            height={100}
            alt="quote"
          />
          <RotatingTagline />
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="flex items-center justify-start gap-4"
        >
          <Link
            href="/register"
            className="px-6 py-3 text-base font-semibold text-white bg-primary hover:bg-primary-dark rounded-xs shadow-sm transition-colors"
          >
            Track Shippment
          </Link>
          {/* <Link
            href="/login"
            className="px-6 py-3 text-base outline outline-primary outline-offset-2 border border-primary font-semibold text-primary bg-background hover:bg-gray-200 rounded-xs transition-colors"
          >
            Sign in
          </Link> */}
        </motion.div>
      </div>
    </section>
  );
}
