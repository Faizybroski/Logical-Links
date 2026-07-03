"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Quote, Star, User } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    content:
      "Logical Links transformed our delivery operations. Their tracking system and reliability have been game-changing for our business.",
    name: "Sarah Chen",
    role: "Operations Manager",
    company: "TechFlow Solutions",
  },
  {
    content:
      "The integration with our platform was seamless. Customer satisfaction with deliveries has increased by 40% since partnering with them.",
    name: "Michael Rodriguez",
    role: "E-commerce Director",
    company: "Urban Marketplace",
  },
  {
    content:
      "From same-day delivery to freight shipping, they handle everything with precision. Truly a comprehensive logistics partner.",
    name: "Emily Watson",
    role: "Supply Chain Lead",
    company: "Northern Distributors",
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

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-24 overflow-hidden">
      <div className="absolute left-0 top-0 h-full w-96 bg-primary/5 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-full w-96 bg-primary/5 blur-3xl" />

      <div className="max-w-6xl relative mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="font-bold text-4xl sm:text-6xl leading-none text-primary">
            <span className="display-font">Trusted by</span>{" "}
            <span className="display-font">Industry Leaders</span>
          </h2>
          <p className="mt-6 text-muted text-lg">
            Don&apos;t just take our word for it. See what our clients say about our
            logistics solutions.
          </p>
        </motion.div>

        {/* Testimonials */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item, i) => (
            <motion.div
              key={item.name}
              custom={i}
              // variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <TestimonialCard {...item} />
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mt-14 rounded-xl border border-primary/20 p-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            <Stat number="500+" label="Happy Clients" />
            <Stat number="4.9/5" label="Average Rating" />
            <Stat number="99%" label="Satisfaction Rate" />
            <Stat number="24/7" label="Support Available" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function TestimonialCard({
  content,
  name,
  role,
  company,
}: {
  content: string;
  name: string;
  role: string;
  company: string;
}) {
  return (
    <Card className="group relative overflow-hidden ring-0 border border-primary-light/20 shadow-none h-full">
      <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-primary/5" />
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-5">
          <Quote className="h-6 w-6 text-primary" />
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-primary text-primary" />
            ))}
          </div>
        </div>
        <p className="text-muted leading-relaxed text-sm mb-5">{content}</p>
        <div className="flex items-center gap-4">
          <div className="flex p-3 items-center justify-center rounded-full bg-primary-light text-muted">
            <User className="h-5 w-5 fill-muted" />
          </div>
          <div>
            <p className="font-normal text-muted text-sm">{name}</p>
            <p className="text-primary text-xs">{role}</p>
            <p className="text-muted text-xs">{company}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-3xl font-light text-primary">{number}</div>
      <p className="mt-2 text-muted text-lg">{label}</p>
    </div>
  );
}
