"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function About() {
  return (
    <section
      id="about"
      className="py-20 bg-[url('/about.svg')] bg-contain bg-center"
    >
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h1 className="text-4xl sm:text-6xl font-bold text-primary mb-6">
            About Us
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="text-lg text-gray-700 leading-relaxed"
        >
          {/* At the core of our business is a strong commitment to delivering
          logistics and courier solutions that are both reliable and tailored to
          your unique needs. What sets us apart is our combination of advanced
          technology, industry expertise, and genuine care for every shipment we
          manage. We prioritize clear communication, on-time delivery, and
          precise execution, ensuring a smooth and efficient experience from
          start to finish. */}
          At the core of Logical Links is a commitment to delivering reliable
          logistics and transportation solutions tailored to the needs of every
          client. By combining advanced technology, industry expertise, and
          responsive service, we ensure every operation is managed with
          precision, transparency, and care.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="text-lg text-gray-700 leading-relaxed mb-6"
        >
          {/* Through continuous innovation and ongoing skill development, we
          position ourselves as leaders in the logistics and courier sector.
          With us, you're not just a customer — you're a valued partner, and we
          are dedicated to supporting your success every step of the way. */}
          Through continuous improvement and operational discipline, we help
          businesses move forward with confidence. At Logical Links, you're more
          than a customer - you're a valued partner, and your success drives
          everything we do.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          {/* <Link
            href="/register"
            className="px-16 py-3 text-sm font-medium text-white outline outline-1 outline-primary outline-offset-2 bg-primary hover:bg-primary-dark rounded-xs transition-colors"
          >
            Get a Quote
          </Link> */}
        </motion.div>
      </div>
    </section>
  );
}
