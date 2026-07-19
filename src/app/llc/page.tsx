"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Users, Target, Globe2 } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/landingPage/Header";
import Footer from "@/components/landingPage/Footer";

const values = [
  {
    icon: ShieldCheck,
    title: "Reliability",
    description:
      "Every shipment is managed with precision, transparency, and care from pickup to final delivery.",
  },
  {
    icon: Target,
    title: "Precision Execution",
    description:
      "Advanced technology and industry expertise ensure operations run smoothly and on schedule.",
  },
  {
    icon: Users,
    title: "Genuine Partnership",
    description:
      "You're more than a customer - you're a valued partner, and your success drives everything we do.",
  },
  {
    icon: Globe2,
    title: "Continuous Growth",
    description:
      "Ongoing innovation and operational discipline keep us ahead as leaders in logistics and courier services.",
  },
];

const pillars = [
  {
    id: "mission",
    title: "Our Mission",
    image: "/mission.jpg",
    paragraphs: [
      "Our mission is to redefine logistics and transport by delivering solutions that go beyond movement—building trust through reliability, innovation, and precision. We serve businesses and individuals with services that span freight, courier, medical deliveries, personal shopping, and premium transport.",
      "With every shipment, every mile, and every client interaction, we are committed to setting new standards of excellence, ensuring safety, speed, and peace of mind always.",
    ],
  },
  {
    id: "vision",
    title: "Our Vision",
    image: "/vission.png",
    paragraphs: [
      "Our vision is to set the benchmark for logistics and transport excellence—integrating innovation, precision, and sustainability to move businesses and communities forward. We aspire to be the partner of choice across freight, courier, and specialized services, recognized for redefining reliability and creating smarter, safer, and more connected supply chains.",
      "By constantly evolving and leading with purpose, we aim to transform the future of logistics into one that empowers progress, delivers certainty, and builds enduring trust worldwide.",
    ],
  },
  {
    id: "values",
    title: "Our Values",
    image: "/values.png",
    paragraphs: [
      "Our business is built on a foundation of integrity, reliability, and a customer-first approach. We believe in doing what we promise, delivering every service—whether logistics, courier, or personal transport—with consistency and care.",
      "Innovation drives us forward, as we continuously embrace new technologies and smarter processes to create safer, faster, and more efficient solutions. We place excellence at the center of everything we do, and we remain committed to sustainability and responsibility, ensuring our services positively impact both our clients and the communities we serve.",
    ],
  },
];

export default function LLCPage() {
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
            Logical Links
            <br className="hidden sm:block" />{" "}
            <span className="text-primary">LLC</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="text-base sm:text-xl font-medium text-gray-600 max-w-xl"
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
          <p className="text-gray-600 leading-relaxed mb-4">
            At LLC, we don&apos;t just deliver services—we deliver certainty.
            In an industry where reliability defines success, we set the
            standard by combining unmatched expertise, advanced technology,
            and a relentless commitment to excellence.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            From managing complex logistics and time-sensitive courier
            shipments to transporting passengers in luxury, delivering
            life-saving medical supplies, or providing seamless shopping and
            delivery solutions, our promise is simple: we get it
            done—safely, efficiently, and without compromise.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            What makes us different is not only the breadth of our services
            but the depth of our dedication. Every shipment, every ride, and
            every delivery is managed with precision and care, supported by
            real-time visibility, customized solutions, and a team that
            operates around the clock to meet your needs without excuses.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            When others say &ldquo;good enough,&rdquo; we go
            further—optimizing costs, accelerating timelines, and
            guaranteeing peace of mind at every step. With LLC, you gain more
            than a provider; you gain a strategic partner who ensures your
            business, your goods, and your lifestyle move forward without
            interruption.
          </p>
          <p className="text-gray-600 leading-relaxed font-semibold">
            Choose confidence. Choose innovation. Choose LLC—where
            reliability is not promised, it&apos;s proven.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-block px-6 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xs shadow-sm transition-colors"
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
                    className="text-gray-600 leading-relaxed mb-4 last:mb-0"
                  >
                    {paragraph}
                  </p>
                ))}
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
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                className="rounded-xs border border-gray-100 p-6 shadow-sm"
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {value.description}
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
