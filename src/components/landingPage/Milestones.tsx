"use client";

import Image from "next/image";
import { ArrowUpRight, Route, MapPinned, Truck, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const milestones = [
  {
    number: "01",
    title: "Top Road Freight Leader",
    description:
      "Recognized for dependable truckload, LTL, and last-mile delivery—consistently on time across major routes.",
  },
  {
    number: "02",
    title: "Smart Road Logistics Pioneer",
    description:
      "Among the first to deploy AI route planning, live GPS tracking, ePOD, and automated dispatch for over-the-road shipments.",
    featured: true,
  },
  {
    number: "03",
    title: "Thousands+ Road Shipments Managed Annually",
    description:
      "Safely moving palletized and parcel freight across cities and regions with strong service reliability.",
  },
  {
    number: "04",
    title: "Sustainability & Fleet Efficiency",
    description:
      "Cutting emissions through optimized routing, consolidated loads, modern vehicles, and idle-reduction practices.",
  },
];

export default function MilestonesSection() {
  return (
    <section id="milestones" className="py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-20 text-center"
        >
          <h2 className="display-font text-4xl font-bold sm:text-5xl md:text-6xl">
            <span className="text-primary">Our Milestones</span>
            <br />
            <span className="text-neutral-900">
              <span className="mr-3 text-primary">—</span>&amp; Achievements
            </span>
          </h2>
        </motion.div>

        <div className="space-y-0">
          {milestones.map((item, i) => (
            <motion.div
              key={item.number}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
            >
              <div className="grid gap-4 border-b border-neutral-200 py-8 md:gap-8 md:grid-cols-[120px_1fr_1.2fr_auto]">
                <div>
                  <span className="text-3xl font-semibold text-primary">{item.number}</span>
                </div>
                <p className="text-2xl font-semibold text-primary">{item.title}</p>
                <p className="max-w-xl text-neutral-700">{item.description}</p>
                {item.featured && (
                  <div className="flex items-start justify-end">
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white transition hover:scale-105"
                    >
                      <ArrowUpRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
              {item.featured && <FeaturedCard />}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative my-10 overflow-hidden rounded-xl"
    >
      {/* Image — taller on mobile so the overlay has room */}
      <div className="relative min-h-[420px] sm:h-[500px] w-full">
        <Image src="/milestone.svg" alt="Smart logistics" fill className="object-cover" />

        {/* Overlay card — full-width on mobile, capped at md on larger screens */}
        <div className="absolute inset-x-4 top-4 sm:inset-auto sm:left-6 sm:top-6 sm:w-full sm:max-w-md rounded-xs border-2 border-white/50 bg-black/30 p-5 sm:p-8 text-white backdrop-blur-sm">
          <p className="mb-3 text-xl sm:text-3xl font-semibold sm:font-bold leading-tight">
            Smart Road Logistics,
            <br />
            Smarter Future
          </p>
          <p className="mb-5 sm:mb-8 text-xs sm:text-base text-white/90 font-light">
            At Logical Links, technology isn&apos;t an add-on—it&apos;s how we deliver
            faster, safer road shipments.
          </p>
          <div className="space-y-2 sm:space-y-3">
            <FeatureItem icon={<Route className="w-4 h-4 sm:w-5 sm:h-5" />} text="AI-powered route & load optimization." />
            <FeatureItem icon={<MapPinned className="w-4 h-4 sm:w-5 sm:h-5" />} text="Real-time GPS tracking & ePOD." />
            <FeatureItem icon={<Truck className="w-4 h-4 sm:w-5 sm:h-5" />} text="Smart dock & yard scheduling." />
            <FeatureItem icon={<BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />} text="Predictive ETAs & demand forecasting." />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex p-2 items-center justify-center">{icon}</div>
      <span className="sm:font-medium font-light text-sm sm:text-base">{text}</span>
    </div>
  );
}
