"use client";

import Link from "next/link";
import { ClipboardList, Truck, Package } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    number: 1,
    title: "Book Your Shipment",
    description:
      "Simple online booking with instant quotes and flexible scheduling options.",
    icon: ClipboardList,
  },
  {
    number: 2,
    title: "We Pick Up",
    description:
      "Professional drivers collect your items with real-time GPS tracking from start to finish.",
    icon: Truck,
  },
  {
    number: 3,
    title: "Delivered with Care",
    description:
      "Safe delivery with proof of delivery and customer satisfaction guaranteed.",
    icon: Package,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function HowItWorks() {
  return (
    <section id="hiw" className="relative py-24">
      <div className="absolute left-8 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary-light/20 blur-[120px]" />
      <div className="absolute right-8 top-1 -translate-y-1 w-64 h-64 rounded-full bg-primary-light/20 blur-[120px]" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <h2 className="display-font text-4xl sm:text-6xl font-bold text-primary leading-tight mb-6">
            How It Works
          </h2>
          <p className="text-lg text-muted">
            Three simple steps to experience the gold standard in logistics.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="relative grid lg:grid-cols-3 gap-14"
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div key={step.number} variants={cardVariants} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 left-full w-14 h-px bg-primary -translate-y-1/2 z-0" />
                )}
                <div className="flex flex-col relative h-full border border-primary rounded-xs bg-white py-8 px-4 text-center">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-xl font-medium">
                    {step.number}
                  </div>
                  <div className="p-5 rounded-sm bg-primary-light/10 flex items-center justify-center mx-auto mb-10">
                    <Icon className="h-8 w-8 text-primary" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl text-primary mb-6">{step.title}</h3>
                  <p className="text-muted text-sm">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mt-10"
        >
          <Link
            href="/register"
            className="px-10 py-2 text-sm font-medium text-white outline outline-1 outline-primary outline-offset-2 bg-primary hover:bg-primary-dark rounded-xs transition-colors"
          >
            Start Your Shipment
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
