"use client";

import Image from "next/image";
import Link from "next/link";
import { LogIn, UserPlus, Truck, HeadphonesIcon, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/landingPage/Header";
import Footer from "@/components/landingPage/Footer";

const hubLinks = [
  {
    icon: LogIn,
    title: "Sign In",
    description: "Access your dashboard to manage shipments, quotations, and invoices.",
    href: "/login",
    cta: "Log In",
  },
  {
    icon: UserPlus,
    title: "Create an Account",
    description: "Set up your company account to start booking and tracking freight.",
    href: "/register",
    cta: "Sign Up",
  },
  {
    icon: Truck,
    title: "Track a Shipment",
    description: "Sign in to view real-time status and delivery updates on your loads.",
    href: "/register",
    cta: "Track Shipment",
  },
  {
    icon: HeadphonesIcon,
    title: "Talk to Support",
    description: "Have a question about an order or need a custom quote? We're here to help.",
    href: "/#quote",
    cta: "Contact Us",
  },
];

export default function AccessHubPage() {
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
            Access
            <br className="hidden sm:block" />{" "}
            <span className="text-primary">Hub</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="text-base sm:text-xl font-medium text-gray-600 max-w-xl"
          >
            Your single entry point to sign in, manage shipments, and get
            support - all in one place.
          </motion.p>
        </section>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20 w-full">
        <div className="grid gap-6 sm:grid-cols-2">
          {hubLinks.map((link, i) => (
            <motion.div
              key={link.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
              className="group relative overflow-hidden rounded-xs border border-gray-100 p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-5 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <link.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">
                {link.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                {link.description}
              </p>
              <Link
                href={link.href}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                {link.cta}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mt-20 grid gap-10 lg:grid-cols-2 lg:items-center"
        >
          <div>
            <h2 className="text-2xl sm:text-4xl font-bold text-black mb-4">
              Everything in One Portal
            </h2>
            <p className="text-gray-600 leading-relaxed">
              From booking freight to tracking deliveries, quotations, and
              invoices, the Access Hub connects you to every tool you need to
              manage your logistics operations with Logical Links.
            </p>
          </div>
          <div className="relative aspect-[1.45/1] overflow-hidden rounded-xs">
            <Image src="/offer3.png" alt="Access Hub" fill className="object-cover" />
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
