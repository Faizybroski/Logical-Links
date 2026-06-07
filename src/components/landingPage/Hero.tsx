"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section id="hero">
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-start">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6 uppercase"
        >
          Smart
          <br className="hidden sm:block" /> <span className="text-primary">Logistis</span>
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
          End-to-end logistics solutions designed to deliver efficiency,
          visibility, and control
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="flex items-center justify-start gap-4"
        >
          <Link
            href="/register"
            className="px-6 py-3 text-base outline outline-1 outline-primary outline-offset-2 font-semibold text-white bg-primary hover:bg-primary-dark rounded-xs shadow-sm transition-colors"
          >
            Create a free account
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 text-base outline outline-1 outline-primary outline-offset-2 border border-primary font-semibold text-primary bg-background hover:bg-gray-200 rounded-xs transition-colors"
          >
            Sign in
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
