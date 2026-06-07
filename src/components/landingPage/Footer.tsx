"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { motion } from "framer-motion";

function scrollTo(section: string) {
  const el = document.getElementById(section);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export default function Footer() {
  return (
    <footer id="footer" className="relative overflow-hidden rounded-t-[80px] bg-primary text-white">
      <div className="absolute inset-0">
        <Image src="/footer.svg" alt="Warehouse" fill className="object-cover" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="grid gap-12 lg:gap-16 lg:grid-cols-[1.4fr_1fr_1fr]"
        >
          {/* Left */}
          <div>
            <Image src="/logo_white.svg" alt="Logical Links" width={100} height={100} className="mb-8" />
            <p className="max-w-xl text-sm leading-relaxed text-white">
              The gold standard in Canadian logistics. We deliver precision,
              reliability, and innovation to businesses across the nation.
            </p>
            <div className="text-sm mt-10 space-y-5">
              <div className="flex items-center gap-4">
                <MapPin className="h-5 w-5 shrink-0" />
                <span>123 Logistics Ave, Toronto, ON M5V 3A8</span>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="h-5 w-5 shrink-0" />
                <span>1-800-LOGICAL</span>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="h-5 w-5 shrink-0" />
                <span>hello@logicallinks.ca</span>
              </div>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-8 text-2xl font-semibold">Company</h3>
            <div className="flex flex-col gap-5 text-sm">
              <button type="button" onClick={() => scrollTo("about")} className="text-left hover:underline">About Us</button>
              <Link href="#">Careers</Link>
              <Link href="#">News &amp; Updates</Link>
              <Link href="#">Case Studies</Link>
              <button type="button" onClick={() => scrollTo("quote")} className="text-left hover:underline">Contact</button>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-8 text-2xl font-semibold">Get in Touch</h3>
            <div className="space-y-8 text-sm">
              <div className="flex gap-4">
                <div className="flex p-2 items-center justify-center rounded-sm bg-white text-primary self-start">
                  <MapPin className="h-5 w-5 fill-muted text-white" />
                </div>
                <div>
                  <p className="font-medium">Head Office</p>
                  <p className="text-white/90">123 Logistics Way Toronto, ON</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex p-2 items-center justify-center rounded-sm bg-white text-primary self-start">
                  <Phone className="h-5 w-5 fill-muted text-muted" />
                </div>
                <div>
                  <p className="font-medium">1-800-LOGICAL</p>
                  <p className="text-white/90">(1-800-564-4225)</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex p-2 items-center justify-center rounded-sm bg-white text-primary self-start">
                  <Mail className="h-5 w-5 text-muted" />
                </div>
                <div>
                  <p className="font-medium">info@logicallinks.ca</p>
                  <p className="text-white/90">Always Available</p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex gap-4">
              {[FaFacebookF, FaXTwitter, FaLinkedinIn, FaInstagram].map((Icon, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label="Social media"
                  className="flex p-2 items-center justify-center rounded-sm border bg-white/20 backdrop-blur-xs border-white/40 transition hover:bg-white hover:text-primary"
                >
                  <Icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="my-5 h-px bg-white/20" />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-white/90 text-sm">© 2026 Logical Links. All rights reserved.</p>
          <div className="flex gap-8 text-white/90 text-sm">
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
            <Link href="#">Accessibility</Link>
          </div>
        </div>
      </div>

      <div
        className="absolute inset-0"
        style={{
          maskImage: "url('/footerMask.svg')",
          WebkitMaskImage: "url('/footerMask.svg')",
        }}
      />
    </footer>
  );
}
