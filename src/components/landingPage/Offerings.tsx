"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Globe, ArrowLeft, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const services = [
  { id: "01", title: "LLC", image: "/s1.svg", href: "/llc" },
  { id: "02", title: "SERVICES", image: "/s2.svg", href: "/services" },
  { id: "03", title: "Access Hub", image: "/s3.svg", href: "/access-hub" },
];

const offerStatements = [
  {
    label: "Transportation & Logistics:",
    text: "Reliable, cost-effective transportation and logistics solutions tailored to your shipment, timeline, and business needs.",
  },
  {
    label: "Last-Mile Delivery:",
    text: "Fast and dependable last-mile delivery solutions designed to ensure timely, accurate, and professional delivery to the final destination.",
  },
  {
    label: "Logistics Coordination:",
    text: "Streamlined logistics coordination from pickup to delivery, keeping shipments organized, communication clear, and operations running smoothly.",
  },
  {
    label: "Specialized Transportation:",
    text: "Flexible transportation solutions designed for unique cargo requirements, operational demands, and industry-specific shipping needs.",
  },
  {
    label: "Shipment Tracking & Visibility:",
    text: "Advanced tracking and communication tools providing real-time shipment visibility and delivery updates from pickup through final delivery.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: "easeOut" },
  }),
};

export default function Offerings() {
  const [activeIndex, setActiveIndex] = useState(0);

  const goPrev = () =>
    setActiveIndex(
      (prev) => (prev - 1 + offerStatements.length) % offerStatements.length,
    );
  const goNext = () =>
    setActiveIndex((prev) => (prev + 1) % offerStatements.length);

  return (
    <section id="offerings" className="py-24">
      <div className="max-w-6xl mx-auto">
        {/* Top Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              custom={i}
              // variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <ServiceCard {...service} />
            </motion.div>
          ))}
        </div>

        {/* Bottom Content */}
        <div className="mt-20 grid lg:grid-cols-2">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h2 className="font-serif font-semibold leading-[0.9]">
              <span className="block display-font text-primary text-4xl sm:text-6xl">
                WHAT WE
              </span>
              <span className="flex items-center gap-6">
                <span className="h-2 w-12 rounded-full bg-primary" />
                <span className="text-black display-font text-4xl sm:text-6xl">
                  CAN OFFER
                </span>
              </span>
            </h2>

            <div className="mt-10 max-w-lg min-h-20">
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="text-sm leading-relaxed text-black"
                >
                  <span className="font-bold">
                    {offerStatements[activeIndex].label}
                  </span>{" "}
                  {offerStatements[activeIndex].text}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="mt-12 flex items-center gap-6">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={goPrev}
                aria-label="Previous statement"
              >
                <ArrowLeft className="h-6 w-6 text-primary" />
              </Button>
              <div className="flex gap-2">
                {offerStatements.map((statement, i) => (
                  <button
                    key={statement.label}
                    onClick={() => setActiveIndex(i)}
                    aria-label={`Show: ${statement.label}`}
                    className={`h-1.5 w-10 rounded-full transition-colors ${
                      i === activeIndex ? "bg-primary" : "bg-primary/20"
                    }`}
                  />
                ))}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={goNext}
                aria-label="Next statement"
              >
                <ArrowRight className="h-6 w-6 text-primary" />
              </Button>
            </div>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <p className="text-lg leading-relaxed text-black">
              We provide reliable transportation and logistics solutions
              designed around the needs of your business.
            </p>
            <p className="mt-6 text-lg leading-relaxed text-black">
              From freight transportation and specialized solutions to last-mile
              delivery and shipment coordination, we manage each shipment with
              precision, transparency, and care—from pickup to final delivery.
            </p>

            <p className="mt-10 text-sm font-medium text-black">
              Experience dependable service with{" "}
              <span className="font-bold">LOGICAL LINKS</span>.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  image,
  title,
  id,
  href,
}: {
  image: string;
  title: string;
  id: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-xs"
    >
      <div className="relative aspect-[1.45/1]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-5 right-5 top-3 flex items-center justify-between">
          <div className="flex p-1 items-center justify-center rounded-full border border-white/60 backdrop-blur-sm">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <div className="rounded-full border border-white/60 bg-black/10 px-3 py-2 text-xs text-white backdrop-blur-sm">
            Transport
          </div>
        </div>
        <div className="absolute bottom-3 left-5 right-5 flex items-end justify-between">
          <h3 className="text-2xl font-semibold text-white">{title}</h3>
          <span className="self-start text-lg font-light text-white">{id}</span>
        </div>
      </div>
    </Link>
  );
}
