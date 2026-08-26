"use client";

import {
  Monitor,
  CheckCircle2,
  ScanSearch,
  Network,
  Globe,
  Truck,
  Users,
  Route,
  Zap,
  Search,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";

const intelligence: {
  icon: LucideIcon;
  label: string;
  status: string;
}[] = [
  { icon: Monitor, label: "Live Shipment Visibility", status: "Active" },
  { icon: CheckCircle2, label: "Dispatch System", status: "Operational" },
  { icon: ScanSearch, label: "Tracking System", status: "Real-Time" },
  { icon: Network, label: "Network Coordination", status: "Enabled" },
];

const services: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: Globe,
    title: "Freight Brokerage",
    description:
      "Connecting businesses with the right capacity through our trusted carrier network.",
  },
  {
    icon: Truck,
    title: "Transport Execution",
    description:
      "Reliable transportation solutions executed with precision and efficiency.",
  },
  {
    icon: Users,
    title: "Logistics Coordination",
    description:
      "End-to-end coordination that ensures smooth movement across the supply chain.",
  },
  {
    icon: Route,
    title: "Dispatch & Route Management",
    description:
      "Optimized dispatching and routing for faster deliveries and reduced operational costs.",
  },
  {
    icon: Zap,
    title: "Last-Mile Delivery",
    description:
      "Seamless last-mile delivery solutions built for speed and customer satisfaction.",
  },
  {
    icon: Search,
    title: "Real-Time Shipment Tracking",
    description:
      "Complete visibility into shipments with real-time updates at every stage.",
  },
];

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
          <h2 className="display-font text-4xl sm:text-6xl font-bold text-primary leading-tight mb-6">
            Built for Operations
          </h2>
          <p className="text-lg text-black">
            The systems and services running behind every delivery we manage.
          </p>
        </motion.div>

        {/* Operational Intelligence */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="rounded-xs border border-primary bg-white p-8 sm:p-10"
        >
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-primary/20">
            {intelligence.map(({ icon: Icon, label, status }) => (
              <div
                key={label}
                className="flex items-center gap-4 lg:pl-8 lg:first:pl-0"
              >
                <div className="p-4 rounded-sm bg-primary-light/10 flex items-center justify-center shrink-0">
                  <Icon className="h-7 w-7 text-primary" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-primary font-medium leading-snug">
                    {label}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-sm text-black">{status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Core Services */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mt-24 mb-16"
        >
          <h2 className="display-font text-4xl sm:text-6xl font-bold text-primary leading-tight mb-6">
            Core Services
          </h2>
          <p className="text-lg text-black">
            The full range of logistics capabilities we deliver, end to end.
          </p>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
              className="flex flex-col h-full border border-primary rounded-xs bg-white py-8 px-4 text-center"
            >
              <div className="p-5 rounded-sm bg-primary-light/10 flex items-center justify-center mx-auto mb-10">
                <Icon className="h-8 w-8 text-primary" strokeWidth={2} />
              </div>
              <h3 className="text-xl text-primary mb-6">{title}</h3>
              <p className="text-black text-sm">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
