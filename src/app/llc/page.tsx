"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Users, Target, Globe2 } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/landingPage/Header";
import HeroScrim from "@/components/landingPage/HeroScrim";
import Footer from "@/components/landingPage/Footer";

const drivers = [
  {
    icon: ShieldCheck,
    title: "Reliability",
    description:
      "We understand that timing and dependability matter. Every movement is managed with care, communication, and attention to detail.",
  },
  {
    icon: Target,
    title: "Precision Execution",
    description:
      "Effective logistics requires planning and coordination. We combine operational discipline with technology to keep services organized and on track.",
  },
  {
    icon: Users,
    title: "Genuine Partnership",
    description:
      "You're more than a customer. We take the time to understand your needs and work with you to develop the right solution.",
  },
  {
    icon: Globe2,
    title: "Continuous Growth",
    description:
      "We continue to improve our technology, processes, and capabilities so we can respond to changing customer needs and the evolving logistics landscape.",
  },
];

interface Pillar {
  id: string;
  title: string;
  image: string;
  paragraphs: string[];
  items?: { title: string; description: string }[];
}

const pillars: Pillar[] = [
  {
    id: "mission",
    title: "Our Mission",
    image: "/mission.jpg",
    paragraphs: [
      "Our mission is to provide reliable, efficient, and technology-driven logistics and transportation solutions that keep what matters moving safely and efficiently.",
      "We serve businesses, organizations, and individuals through freight, courier, medical delivery, and specialized transportation services, with a focus on safety, precision, transparency, and responsive service.",
      "With every shipment, delivery, movement, and customer interaction, we strive to make the experience straightforward, dependable, and worthy of our customers' trust.",
    ],
  },
  {
    id: "vision",
    title: "Our Vision",
    image: "/values-bg.svg",
    paragraphs: [
      "Our vision is to create a more connected, efficient, and dependable future for logistics and transportation.",
      "We aim to become a trusted partner for businesses and customers by combining technology, operational expertise, and customer-focused service to create smarter solutions for an evolving world.",
      "As we grow, we will continue to expand our capabilities, improve our processes, and adopt new technologies while remaining grounded in the principles that define LLC: reliability, accountability, care, and service.",
    ],
  },
  {
    id: "values",
    title: "Our Values",
    image: "/values.png",
    paragraphs: [
      "Our values shape how we operate, how we serve our customers, and how we approach every movement we manage.",
    ],
    items: [
      { title: "Integrity", description: "We communicate honestly, act responsibly, and do what we say we will do." },
      { title: "Reliability", description: "Our customers depend on us to follow through. We take that responsibility seriously and work to deliver consistently dependable service." },
      { title: "Customer Focus", description: "Every customer has different needs. We listen, understand those needs, and build solutions around them." },
      { title: "Innovation", description: "We embrace technology and smarter processes that improve visibility, efficiency, communication, and the overall customer experience." },
      { title: "Excellence", description: "We take pride in our work and continually look for ways to improve our services and operations." },
      { title: "Accountability", description: "We take ownership of our commitments, address challenges directly, and remain responsible for the service we provide." },
    ],
  },
];

export default function LLCPage() {
  return (
    <div className="landing-page min-h-screen bg-white flex flex-col">
      <Header />
      <div className="relative isolate flex flex-col bg-[url('/aboutus-hero.svg?v=2')] bg-[length:100%_100%] bg-center bg-no-repeat min-h-[50vw] pt-10">
        <HeroScrim />

        <section className="w-full max-w-6xl mx-auto my-auto pt-24 pb-12 px-6 text-start">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-3xl sm:text-6xl text-black font-bold leading-tight mb-6 uppercase"
          >
            Logical Links
            <br className="hidden sm:block" />{" "}
            <span className="text-primary">LLC</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="text-base sm:text-xl font-medium text-black max-w-xl"
          >
            The company behind the gold standard in Canadian logistics.
          </motion.p>
        </section>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h2 className="text-2xl sm:text-4xl font-bold text-black mb-4">
            About Us
          </h2>
          <p className="text-black leading-relaxed mb-4">
            At LLC, we don&apos;t just provide logistics services &mdash; we
            provide confidence in every move. We combine industry knowledge,
            technology, and disciplined execution to deliver dependable
            logistics and transportation solutions built around the needs of
            our customers.
          </p>
          <p className="text-black leading-relaxed mb-4">
            From freight and courier services to medical deliveries and
            specialized transportation, every movement requires careful
            planning, clear communication, and attention to detail. Our
            approach is simple: understand what needs to be accomplished,
            build the right solution, and follow through from start to
            finish.
          </p>
          <p className="text-black leading-relaxed mb-4">
            What sets us apart is our commitment to reliability and service.
            We use technology to improve visibility, streamline coordination,
            and keep our customers informed throughout the process. Whether
            we&apos;re handling a time-sensitive delivery, coordinating
            freight, or supporting a specialized transportation requirement,
            we approach every job with the same level of care and
            accountability.
          </p>
          <p className="text-black leading-relaxed mb-4">
            We believe logistics is about more than getting something from one
            place to another. It&apos;s about keeping businesses operating,
            supporting essential services, and helping our customers move
            forward with confidence.
          </p>
          <p className="text-black leading-relaxed mb-4">
            With LLC, you gain more than a service provider. You gain a
            logistics partner focused on reliability, accountability, and
            solutions that work.
          </p>
          <p className="text-black leading-relaxed font-semibold">
            Choose confidence. Choose innovation.
          </p>
          <p className="text-black leading-relaxed font-semibold">
            Choose LLC &mdash; where reliability is built into every move.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-block px-6 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-[8px] shadow-sm transition-colors"
          >
            Get Started
          </Link>
        </motion.div>

        <div className="mt-24 space-y-24">
          {pillars.map((pillar, i) => (
            <motion.section
              key={pillar.id}
              id={pillar.id}
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
                  src={pillar.image}
                  alt={pillar.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                <h2 className="text-2xl sm:text-4xl font-bold text-black mb-4">
                  {pillar.title}
                </h2>
                {pillar.paragraphs.map((paragraph, j) => (
                  <p
                    key={j}
                    className="text-black leading-relaxed mb-4 last:mb-0"
                  >
                    {paragraph}
                  </p>
                ))}
                {pillar.items && (
                  <div className="mt-6 space-y-4">
                    {pillar.items.map((item) => (
                      <div key={item.title}>
                        <p className="font-semibold text-primary">
                          {item.title}
                        </p>
                        <p className="text-black leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.section>
          ))}
        </div>

        <div className="mt-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-2xl sm:text-4xl font-bold text-black mb-10 text-center"
          >
            What Drives Us
          </motion.h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {drivers.map((driver, i) => (
              <motion.div
                key={driver.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                className="rounded-xs border border-gray-100 p-6 shadow-sm"
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <driver.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  {driver.title}
                </h3>
                <p className="text-sm text-black leading-relaxed">
                  {driver.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
