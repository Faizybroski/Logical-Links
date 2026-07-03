"use client";

import Image from "next/image";
import { Smartphone, BarChart3, ShieldCheck, Zap, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

const features = [
  {
    icon: Smartphone,
    title: "Real-Time Tracking",
    description: "Live GPS tracking with push notifications and delivery updates.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Comprehensive insights into your shipping patterns and costs.",
  },
  {
    icon: ShieldCheck,
    title: "Proof of Delivery",
    description: "Digital signatures, photos, and timestamp verification.",
  },
  {
    icon: Zap,
    title: "API Integration",
    description: "Seamless integration with your existing e-commerce platform.",
  },
];

export default function Techonologies() {
  return (
    <section id="technologies" className="relative overflow-hidden py-28">
      <div className="sm:block absolute inset-0 hidden">
        <Image
          src="/technologies.svg"
          alt="Fleet Technology"
          fill
          priority
          className="object-contain object-bottom"
        />
      </div>

      <div className="max-w-6xl relative z-10 mx-auto">
        <div className="max-w-lg">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="font-display leading-[0.9]"
          >
            <span className="block display-font text-primary font-bold text-4xl sm:text-6xl">
              Technology That
            </span>
            <span className="block display-font text-foreground font-bold text-4xl sm:text-6xl">
              Transforms
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="mt-8 max-w-lg text-lg leading-relaxed text-muted"
          >
            Advanced tracking and analytics powered by cutting-edge technology
            to give you complete visibility into your logistics operations.
          </motion.p>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {features.map((feature, i) => (
              <FeatureCard key={feature.title} {...feature} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, description, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-xs bg-primary p-4 text-white bg-[url('/tech_round.svg')] bg-no-repeat bg-[position:top_-30_right_-50]"
    >
      {/* <div className="absolute -right-10 -top-10 bg-[url('/tech_round.svg')]" /> */}
      {/* <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15" /> */}
      {/* <div className="absolute -right-2 top-4 h-24 w-24 rounded-full bg-white/20" /> */}
      <div className="relative z-10">
        <Icon className="mb-2 h-6 w-6" strokeWidth={2} />
        <p className="mb-1 text-lg font-semibold">{title}</p>
        <p className="text-xs leading-relaxed text-white/90">{description}</p>
      </div>
    </motion.div>
  );
}
