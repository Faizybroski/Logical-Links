"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/landingPage/Header";
import Footer from "@/components/landingPage/Footer";

const services = [
  {
    slug: "ftl-ltl-transportation",
    title: "FTL & LTL Transportation",
    items: ["Full Truckload (FTL)", "Less Than Truckload (LTL)"],
    description:
      "Full and partial truckload transportation designed for efficient, cost-effective freight movement across regional and long-haul routes.",
    details:
      "Whether you're moving a single full container or a smaller partial shipment, our FTL and LTL network gives you the flexibility to match capacity to your freight volume. FTL keeps your goods on a dedicated trailer from pickup to delivery, while LTL lets you share space and cost with other shipments without sacrificing reliability or visibility.",
    image: "/service1.svg",
  },
  {
    slug: "dedicated-specialized-transport",
    title: "Dedicated & Specialized Transport",
    items: ["Dedicated Trucking Services", "Specialized & Heavy Transport"],
    description:
      "Dedicated vehicles and specialized equipment for oversized, heavy, and project-based freight transportation.",
    details:
      "For freight that doesn't fit a standard trailer, our dedicated fleet and specialized equipment handle oversized, heavy, and project-based loads with the right permits, planning, and handling procedures. Dedicated trucking gives you a consistent vehicle and driver assigned solely to your operation for predictable capacity and scheduling.",
    image: "/service2.svg",
  },
  {
    slug: "rush-delivery-solutions",
    title: "RUSH Delivery Solutions",
    items: ["Last-Mile Delivery", "E-Commerce Delivery", "Courier Services"],
    description:
      "Same-day and last-mile delivery solutions for time-sensitive retail, e-commerce, and healthcare shipments.",
    details:
      "When timing is critical, our RUSH network delivers same-day and last-mile solutions built for retail, e-commerce, and healthcare shipments. From single parcels to courier runs, we prioritize speed without losing the tracking and accountability you expect from every shipment.",
    image: "/service3.svg",
  },
];

export default function ServicesPage() {
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
            Our
            <br className="hidden sm:block" />{" "}
            <span className="text-primary">Services</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="text-base sm:text-xl font-medium text-gray-600 max-w-xl"
          >
            Explore our transportation and delivery solutions designed to
            support businesses of all sizes.
          </motion.p>
        </section>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20 space-y-24 w-full">
        {services.map((service, i) => (
          <motion.section
            key={service.slug}
            id={service.slug}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="scroll-mt-28 grid gap-10 lg:grid-cols-2 lg:items-center"
          >
            <div
              className={`relative aspect-[1.2] overflow-hidden rounded-xs ${
                i % 2 === 1 ? "lg:order-2" : ""
              }`}
            >
              <Image
                src={service.image}
                alt={service.title}
                fill
                className="object-cover"
              />
            </div>

            <div className={i % 2 === 1 ? "lg:order-1" : ""}>
              <h2 className="text-2xl sm:text-4xl font-bold text-black mb-4">
                {service.title}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                {service.details}
              </p>

              <ul className="space-y-3 mb-8">
                {service.items.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm sm:text-base text-gray-800">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/#quote"
                className="inline-block px-6 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xs shadow-sm transition-colors"
              >
                Request a Quote
              </Link>
            </div>
          </motion.section>
        ))}
      </div>

      <Footer />
    </div>
  );
}
