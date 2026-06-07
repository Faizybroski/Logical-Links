"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const services = [
  {
    title: "FTL (Full Truckload) | LTL (Less Than Truckload)",
    description:
      "Ensuring the safe and secure delivery of your freight to destination.",
    image: "/service1.svg",
  },
  {
    title: "Dedicated Trucking Services | Special or Heavy Transport",
    description:
      "Reliable transportation solutions for specialized freight requirements.",
    image: "/service2.svg",
  },
  {
    title: "RUSH (Courier Services)",
    description:
      "Fast and secure same-day courier delivery for urgent shipments.",
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
        <ArrowUpRight className="absolute right-20 top-16 size-48 text-white/10 stroke-[3]" />

        <div className="container relative z-10 mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <h2 className="text-3xl sm:text-5xl leading-tight font-bold text-white">
              Tailored Logistics Services
              <br />
              <span className="flex items-center gap-5">
                <span className="h-2 w-10 rounded-full bg-primary" />
                to Fit Your Business
              </span>
            </h2>

            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/80">
              At Logical Links, we specialize in providing fast and reliable
              logistics solutions that fit your business needs. From local
              deliveries to international shipments every package reaches safely
              and on time.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                custom={i}
                variants={cardVariants}
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
  description,
  image,
}: {
  title: string;
  description: string;
  image: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg">
      <div className="relative aspect-[1.2]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 p-6 flex flex-col justify-between">
          <div>
            <p className="text-white text-2xl font-medium leading-tight">{title}</p>
            <p className="mt-3 text-xs text-white/80 line-clamp-2">{description}</p>
          </div>
          <div className="flex justify-end">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full bg-white hover:bg-white"
            >
              <ArrowUpRight className="size-5 text-black" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
