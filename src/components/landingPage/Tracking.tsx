"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Tracking() {
  return (
    <section id="tracking" className="py-24">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h1 className="text-4xl sm:text-6xl font-bold leading-tight">
              <span className="text-primary">Smart Logistics.</span>
              <br />
              <span className="text-foreground">Delivered with</span>
              <br />
              <span className="text-foreground">Logic.</span>
            </h1>

            <p className="mt-8 max-w-xl text-sm text-muted leading-relaxed">
              Seamless courier &amp; freight solutions across Canada, powered by
              technology and tailored for modern businesses.
            </p>

            <div className="w-full mt-10">
              <Link
                href="/register"
                className="flex w-full flex-1 justify-center items-center py-3 text-sm font-medium text-center text-white outline-1 outline-primary outline-offset-2 bg-primary hover:bg-primary-dark rounded-xs transition-colors"
              >
                Get a Quote
              </Link>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative"
          >
            <div className="overflow-hidden rounded-sm">
              <img
                src="/tracking.svg"
                alt="Logistics Truck"
                className="w-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
