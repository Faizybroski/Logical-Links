"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="py-20 bg-[url('/about.svg')] bg-cover bg-center">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-4xl sm:text-6xl font-bold text-primary leading-tight mb-6"
        >
          About Us
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="text-lg text-gray-700 leading-relaxed"
        >
          At the core of our business is a strong commitment to delivering
          logistics and courier solutions that are both reliable and tailored to
          your unique needs. What sets us apart is our combination of advanced
          technology, industry expertise, and genuine care for every shipment we
          manage. We prioritize clear communication, on-time delivery, and
          precise execution, ensuring a smooth and efficient experience from
          start to finish.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="text-lg text-gray-700 leading-relaxed mb-6"
        >
          Through continuous innovation and ongoing skill development, we
          position ourselves as leaders in the logistics and courier sector.
          With us, you're not just a customer — you're a valued partner, and we
          are dedicated to supporting your success every step of the way.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          <Link
            href="/register"
            className="px-16 py-2 text-sm font-medium text-white outline outline-1 outline-primary outline-offset-2 bg-primary hover:bg-primary-dark rounded-xs transition-colors"
          >
            Get a Quote
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
