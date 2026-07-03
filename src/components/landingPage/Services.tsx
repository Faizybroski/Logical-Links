"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const services = [
  {
    title: "FTL & LTL Transportation",
    items: ["Full Truckload (FTL)", "Less Than Truckload (LTL)"],
    description:
      "Full and partial truckload transportation designed for efficient, cost-effective freight movement across regional and long-haul routes.",
    image: "/service1.svg",
  },
  {
    title: "Dedicated & Specialized Transport",
    items: ["Dedicated Trucking Services", "Specialized & Heavy Transport"],
    description:
      "Dedicated vehicles and specialized equipment for oversized, heavy, and project-based freight transportation.",
    image: "/service2.svg",
  },
  {
    title: "RUSH Delivery Solutions",
    items: ["Last-Mile Delivery", "E-Commerce Delivery", "Courier Services"],
    description:
      "Same-day and last-mile delivery solutions for time-sensitive retail, e-commerce, and healthcare shipments.",
    image: "/service3.svg",
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

export default function Services() {
  return (
    <section id="services" className="relative overflow-hidden py-24">
      <Image src="/services.svg" alt="" fill className="object-cover" />

      <div className="max-w-6xl mx-auto">
        <ArrowUpRight className="absolute right-3 top-16 size-48 text-white/10 stroke-3" />

        <div className="relative z-10 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <h2 className="text-3xl sm:text-6xl leading-tight font-bold text-white">
              Tailored Logistics Services
              <br />
              <span className="flex items-center gap-5">
                <span className="h-2 w-10 rounded-full bg-primary" />
                to Fit Your Business
              </span>
            </h2>

            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/80">
              Explore our transportation and delivery solutions designed to
              support businesses of all sizes. Select a category below to learn
              more about the solution that best fits your needs.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
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
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  title,
  items,
  description,
  image,
}: {
  title: string;
  items: string[];
  description: string;
  image: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xs">
      <div className="relative aspect-[1.2]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 p-6 flex flex-col justify-between">
          <div>
            <p className="text-white text-2xl font-medium leading-tight">
              {title}
            </p>
            <ul className="mt-3 space-y-0.5">
              {items.map((item) => (
                <li
                  key={item}
                  className="text-xs text-white/80 flex items-center gap-1.5"
                >
                  <span className="h-1 w-1 rounded-full bg-white/60 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-white/80 line-clamp-2">
              {description}
            </p>
          </div>
          <div className="flex justify-end -mr-3 -mb-3">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full bg-white hover:bg-white size-11"
            >
              <ArrowUpRight className="size-7 text-black" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
