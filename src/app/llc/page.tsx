"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Users, Target, Globe2 } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/landingPage/Header";
import Footer from "@/components/landingPage/Footer";

const values = [
  {
    icon: ShieldCheck,
    title: "Reliability",
    description:
      "Every shipment is managed with precision, transparency, and care from pickup to final delivery.",
  },
  {
    icon: Target,
    title: "Precision Execution",
    description:
      "Advanced technology and industry expertise ensure operations run smoothly and on schedule.",
  },
  {
    icon: Users,
    title: "Genuine Partnership",
    description:
      "You're more than a customer - you're a valued partner, and your success drives everything we do.",
  },
  {
    icon: Globe2,
    title: "Continuous Growth",
    description:
      "Ongoing innovation and operational discipline keep us ahead as leaders in logistics and courier services.",
  },
];

export default function LLCPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="bg-[url('/hero2.png')] bg-cover bg-center pt-10">
        <Header />

        <section className="max-w-6xl mx-auto pt-32 pb-20 px-6 text-start">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-3xl sm:text-6xl text-black font-bold leading-tight mb-6 uppercase"
          >
            Logical Links
            <br className="hidden sm:block" />{" "}
            <span className="text-primary">LLC</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="text-base sm:text-xl font-medium text-gray-600 max-w-xl"
          >
            The company behind the gold standard in Canadian logistics.
          </motion.p>
        </section>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="grid gap-10 lg:grid-cols-2 lg:items-center"
        >
          <div className="relative aspect-[1.2] overflow-hidden rounded-xs">
            <Image src="/offer1.png" alt="Logical Links LLC" fill className="object-cover" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-4xl font-bold text-black mb-4">
              Who We Are
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              At the core of Logical Links is a commitment to delivering
              reliable logistics and transportation solutions tailored to the
              needs of every client. By combining advanced technology,
              industry expertise, and responsive service, we ensure every
              operation is managed with precision, transparency, and care.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Through continuous improvement and operational discipline, we
              help businesses move forward with confidence. At Logical Links,
              you&apos;re more than a customer - you&apos;re a valued partner,
              and your success drives everything we do.
            </p>

            <Link
              href="/register"
              className="mt-8 inline-block px-6 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xs shadow-sm transition-colors"
            >
              Get Started
            </Link>
          </div>
        </motion.div>

        <div className="mt-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-2xl sm:text-4xl font-bold text-black mb-10 text-center"
          >
            What Drives Us
          </motion.h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                className="rounded-xs border border-gray-100 p-6 shadow-sm"
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
