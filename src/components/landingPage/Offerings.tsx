"use client";

import Image from "next/image";
import { Globe, ArrowLeft, ArrowRight, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

const services = [
  { id: "01", title: "LLC", image: "/offer1.svg" },
  { id: "02", title: "SERVICES", image: "/offer2.svg" },
  { id: "03", title: "SUPPLEMENTARY", image: "/offer3.svg" },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: "easeOut" },
  }),
};

export default function Offerings() {
  return (
    <section id="offerings" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Top Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
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

        {/* Bottom Content */}
        <div className="mt-20 grid lg:grid-cols-2">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h2 className="font-serif font-semibold leading-[0.9]">
              <span className="block text-primary text-4xl sm:text-6xl">WHAT WE</span>
              <span className="flex items-center gap-6">
                <span className="h-2 w-12 rounded-full bg-primary" />
                <span className="text-foreground text-4xl sm:text-6xl">CAN OFFER</span>
              </span>
            </h2>

            <p className="mt-10 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Reliable, cost-effective courier &amp; logistics solutions—tailored
              shipping, tracking, and fulfillment services you can trust.
            </p>

            <div className="mt-12 flex items-center gap-6">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-6 w-6 text-primary" />
              </Button>
              <div className="flex gap-2">
                <span className="h-1.5 w-10 rounded-full bg-primary" />
                <span className="h-1.5 w-10 rounded-full bg-primary/20" />
                <span className="h-1.5 w-10 rounded-full bg-primary/20" />
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowRight className="h-6 w-6 text-primary" />
              </Button>
            </div>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <p className="text-lg leading-relaxed text-muted">
              At Logical Links, we are committed to delivering logistics and
              courier solutions that go beyond expectations. Through LLC, we
              provide reliable and efficient services tailored to the unique
              needs of individuals and businesses. Our core services cover a
              wide range of transportation and logistics requirements, ensuring
              timely and secure deliveries across local, regional, and global
              networks.
            </p>

            <p className="mt-10 text-sm font-medium">
              Create experience with{" "}
              <span className="font-bold">LOGICAL LINKS</span> and efficient service.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  <Avatar className="border-2 border-background">
                    <AvatarImage src="/avatars/1.jpg" />
                  </Avatar>
                  <Avatar className="border-2 border-background">
                    <AvatarImage src="/avatars/2.jpg" />
                  </Avatar>
                  <Avatar className="border-2 border-background">
                    <AvatarImage src="/avatars/3.jpg" />
                  </Avatar>
                </div>
                <div>
                  <p className="font-medium text-xs">12k+</p>
                  <p className="text-xs text-muted-foreground">happy clients</p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xs ring ring-zinc-300 px-4 py-2">
                <span className="text-sm font-medium">4.5</span>
                <Star className="h-4 w-4 fill-primary text-primary" />
              </div>

              <Button variant="outline" className="border-0 ring ring-zinc-300 bg-transparent gap-2 font-normal text-sm px-4 py-2 h-fit rounded-xs">
                Guest&apos;s Review
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ image, title, id }: { image: string; title: string; id: string }) {
  return (
    <Card className="group relative overflow-hidden rounded-xs border-0 p-0">
      <div className="relative aspect-[1.45/1]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-5 right-5 top-3 flex items-center justify-between">
          <div className="flex p-1 items-center justify-center rounded-full border border-white/60 backdrop-blur-sm">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <div className="rounded-full border border-white/60 bg-black/10 px-3 py-2 text-xs text-white backdrop-blur-sm">
            Transport
          </div>
        </div>
        <div className="absolute bottom-3 left-5 right-5 flex items-end justify-between">
          <h3 className="text-2xl font-semibold text-white">{title}</h3>
          <span className="self-start text-lg font-light text-white">{id}</span>
        </div>
      </div>
    </Card>
  );
}
