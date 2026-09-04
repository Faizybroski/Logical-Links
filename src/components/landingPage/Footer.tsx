// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { useRouter, usePathname } from "next/navigation";
// import { MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";
// import {
//   FaFacebookF,
//   FaInstagram,
//   FaLinkedinIn,
//   FaXTwitter,
// } from "react-icons/fa6";
// import { motion } from "framer-motion";

// export default function Footer() {
//   const router = useRouter();
//   const pathname = usePathname();

//   const goToSection = (section: string) => {
//     if (pathname === "/") {
//       document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
//     } else {
//       router.push(`/#${section}`);
//     }
//   };

//   return (
//     <footer
//       id="footer"
//       className="relative overflow-hidden bg-[#0c0d10] text-white"
//     >
//       {/* Top accent line */}
//       <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

//       {/* Ambient glow */}
//       <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

//       <div className="relative z-10 mx-auto max-w-6xl px-6 pt-20">
//         <motion.div
//           initial={{ opacity: 0, y: 40 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true, amount: 0.2 }}
//           transition={{ duration: 0.7, ease: "easeOut" }}
//           className="grid gap-12 lg:gap-16 lg:grid-cols-[1.4fr_1fr_1fr]"
//         >
//           {/* Left */}
//           <div>
//             <Image
//               src="/logo.svg"
//               alt="Logical Links"
//               width={100}
//               height={100}
//               className="mb-8"
//             />
//             <p className="max-w-xl text-sm leading-relaxed text-white">
//               The gold standard in Canadian logistics. We deliver precision,
//               reliability, and innovation to businesses across the nation.
//             </p>
//             <div className="text-sm mt-10 space-y-5">
//               <div className="flex items-center gap-4">
//                 <MapPin className="h-5 w-5 shrink-0" />
//                 <span>123 Logistics Ave, Toronto, ON M5V 3A8</span>
//               </div>
//               <div className="flex items-center gap-4">
//                 <Phone className="h-5 w-5 shrink-0" />
//                 <span>1-800-LOGICAL</span>
//               </div>
//               <div className="flex items-center gap-4">
//                 <Mail className="h-5 w-5 shrink-0" />
//                 <span>hello@logicallinks.ca</span>
//               </div>
//             </div>
//           </div>

//           {/* Company */}
//           <div>
//             <h3 className="mb-8 text-sm font-semibold uppercase tracking-widest text-white/50">
//               Company
//             </h3>
//             <div className="flex flex-col gap-4 text-sm text-white/80">
//               <button
//                 type="button"
//                 onClick={() => goToSection("about")}
//                 className="group flex w-fit items-center gap-1.5 text-left transition-colors hover:text-primary"
//               >
//                 About Us
//                 <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
//               </button>
//               <Link href="#" className="w-fit transition-colors hover:text-primary">
//                 Careers
//               </Link>
//               <Link href="#" className="w-fit transition-colors hover:text-primary">
//                 News &amp; Updates
//               </Link>
//               <Link href="#" className="w-fit transition-colors hover:text-primary">
//                 Case Studies
//               </Link>
//               <Link href="/tiers" className="w-fit transition-colors hover:text-primary">
//                 Partner Tiers
//               </Link>
//               <button
//                 type="button"
//                 onClick={() => goToSection("quote")}
//                 className="group flex w-fit items-center gap-1.5 text-left transition-colors hover:text-primary"
//               >
//                 Contact
//                 <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
//               </button>
//             </div>
//           </div>

//           {/* Contact */}
//           <div>
//             <h3 className="mb-8 text-sm font-semibold uppercase tracking-widest text-white/50">
//               Get in Touch
//             </h3>
//             <div className="space-y-6 text-sm">
//               <div className="flex gap-4">
//                 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-primary ring-1 ring-white/10">
//                   <MapPin className="h-4.5 w-4.5" />
//                 </div>
//                 <div>
//                   <p className="font-medium">Head Office</p>
//                   <p className="text-white/60">123 Logistics Way Toronto, ON</p>
//                 </div>
//               </div>
//               <div className="flex gap-4">
//                 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-primary ring-1 ring-white/10">
//                   <Phone className="h-4.5 w-4.5" />
//                 </div>
//                 <div>
//                   <p className="font-medium">1-800-LOGICAL</p>
//                   <p className="text-white/60">(1-800-564-4225)</p>
//                 </div>
//               </div>
//               <div className="flex gap-4">
//                 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-primary ring-1 ring-white/10">
//                   <Mail className="h-4.5 w-4.5" />
//                 </div>
//                 <div>
//                   <p className="font-medium">info@logicallinks.ca</p>
//                   <p className="text-white/60">Always Available</p>
//                 </div>
//               </div>
//             </div>

//             <div className="mt-10 flex gap-3">
//               {[FaFacebookF, FaXTwitter, FaLinkedinIn, FaInstagram].map(
//                 (Icon, index) => (
//                   <button
//                     key={index}
//                     type="button"
//                     aria-label="Social media"
//                     className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 transition hover:bg-primary hover:text-[#0c0d10] hover:ring-primary"
//                   >
//                     <Icon className="h-4 w-4" />
//                   </button>
//                 ),
//               )}
//             </div>
//           </div>
//         </motion.div>

//         <div className="my-14 h-px bg-white/10" />

//         <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
//           <p className="text-white/50 text-sm">
//             © 2026 Logical Links. All rights reserved.
//           </p>
//           <div className="flex gap-8 text-white/50 text-sm">
//             <Link href="#" className="transition-colors hover:text-primary">
//               Privacy Policy
//             </Link>
//             <Link href="#" className="transition-colors hover:text-primary">
//               Terms of Service
//             </Link>
//             <Link href="#" className="transition-colors hover:text-primary">
//               Accessibility
//             </Link>
//           </div>
//         </div>
//       </div>

//       <div className="pointer-events-none select-none overflow-hidden pt-2">
//         <p
//           className="whitespace-nowrap text-center font-bold uppercase tracking-wide text-primary text-[11.7vw] leading-none"
//           style={{ fontFamily: "'Times New Roman', Times, serif" }}
//         >
//           Logical Links
//         </p>
//       </div>
//     </footer>
//   );
// }

// ─────────────────────────────────────────────────────────────────────────────
// Previous "gold panel" footer — commented out, replaced by the dark multi-column
// footer below (styled after the approved design mock, content wired to the app).
// ─────────────────────────────────────────────────────────────────────────────
// "use client";
//
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter, usePathname } from "next/navigation";
// import { MapPin, Phone, Mail } from "lucide-react";
// import {
//   FaFacebookF,
//   FaInstagram,
//   FaLinkedinIn,
//   FaXTwitter,
// } from "react-icons/fa6";
// import { motion } from "framer-motion";
//
// export default function Footer() {
//   const router = useRouter();
//   const pathname = usePathname();
//
//   const goToSection = (section: string) => {
//     if (pathname === "/") {
//       document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
//     } else {
//       router.push(`/#${section}`);
//     }
//   };
//
//   return (
//     <footer
//       id="footer"
//       className="relative overflow-hidden bg-primary text-white"
//     >
//       <div className="absolute inset-0">
//         <Image
//           src="/f.svg"
//           alt="Warehouse"
//           fill
//           className="object-cover opacity-20"
//         />
//       </div>
//       <div className="absolute inset-0 bg-primary/90" />
//
//       <div className="relative z-10 mx-auto max-w-6xl py-20">
//         <motion.div
//           initial={{ opacity: 0, y: 40 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true, amount: 0.2 }}
//           transition={{ duration: 0.7, ease: "easeOut" }}
//           className="grid gap-12 lg:gap-16 lg:grid-cols-[1.4fr_1fr_1fr]"
//         >
//           {/* Left */}
//           <div>
//             <Image
//               src="/logo_white.svg"
//               alt="Logical Links"
//               width={100}
//               height={100}
//               className="mb-8"
//             />
//             <p className="max-w-xl text-sm leading-relaxed text-white">
//               The gold standard in Canadian logistics. We deliver precision,
//               reliability, and innovation to businesses across the nation.
//             </p>
//             <div className="text-sm mt-10 space-y-5">
//               <div className="flex items-center gap-4">
//                 <MapPin className="h-5 w-5 shrink-0" />
//                 <span>123 Logistics Ave, Toronto, ON M5V 3A8</span>
//               </div>
//               <div className="flex items-center gap-4">
//                 <Phone className="h-5 w-5 shrink-0" />
//                 <span>1-800-LOGICAL</span>
//               </div>
//               <div className="flex items-center gap-4">
//                 <Mail className="h-5 w-5 shrink-0" />
//                 <span>hello@logicallinks.ca</span>
//               </div>
//             </div>
//           </div>
//
//           {/* Company */}
//           <div>
//             <h3 className="mb-8 text-2xl font-semibold">Company</h3>
//             <div className="flex flex-col gap-5 text-sm">
//               <button
//                 type="button"
//                 onClick={() => goToSection("about")}
//                 className="text-left hover:underline"
//               >
//                 About Us
//               </button>
//               <Link href="#">Careers</Link>
//               <Link href="#">News &amp; Updates</Link>
//               <Link href="#">Case Studies</Link>
//               <Link href="/tiers">Partner Tiers</Link>
//               <button
//                 type="button"
//                 onClick={() => goToSection("quote")}
//                 className="text-left hover:underline"
//               >
//                 Contact
//               </button>
//             </div>
//           </div>
//
//           {/* Contact */}
//           <div>
//             <h3 className="mb-8 text-2xl font-semibold">Get in Touch</h3>
//             <div className="space-y-8 text-sm">
//               <div className="flex gap-4">
//                 <div className="flex p-2 items-center justify-center rounded-sm bg-white text-primary self-start">
//                   <MapPin className="h-5 w-5 fill-muted text-white" />
//                 </div>
//                 <div>
//                   <p className="font-medium">Head Office</p>
//                   <p className="text-white/90">123 Logistics Way Toronto, ON</p>
//                 </div>
//               </div>
//               <div className="flex gap-4">
//                 <div className="flex p-2 items-center justify-center rounded-sm bg-white text-primary self-start">
//                   <Phone className="h-5 w-5 fill-muted text-muted" />
//                 </div>
//                 <div>
//                   <p className="font-medium">1-800-LOGICAL</p>
//                   <p className="text-white/90">(1-800-564-4225)</p>
//                 </div>
//               </div>
//               <div className="flex gap-4">
//                 <div className="flex p-2 items-center justify-center rounded-sm bg-white text-primary self-start">
//                   <Mail className="h-5 w-5 text-muted" />
//                 </div>
//                 <div>
//                   <p className="font-medium">info@logicallinks.ca</p>
//                   <p className="text-white/90">Always Available</p>
//                 </div>
//               </div>
//             </div>
//
//             <div className="mt-10 flex gap-4">
//               {[FaFacebookF, FaXTwitter, FaLinkedinIn, FaInstagram].map(
//                 (Icon, index) => (
//                   <button
//                     key={index}
//                     type="button"
//                     aria-label="Social media"
//                     className="flex p-2 items-center justify-center rounded-sm border bg-white/20 backdrop-blur-xs border-white/40 transition hover:bg-white hover:text-primary"
//                   >
//                     <Icon className="h-5 w-5" />
//                   </button>
//                 ),
//               )}
//             </div>
//           </div>
//         </motion.div>
//
//         <div className="my-5 h-px bg-white/20" />
//
//         <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between pb-[60px]">
//           <p className="text-white/90 text-sm">
//             © 2026 Logical Links. All rights reserved.
//           </p>
//           <div className="flex gap-8 text-white/90 text-sm">
//             <Link href="#">Privacy Policy</Link>
//             <Link href="#">Terms of Service</Link>
//             <Link href="#">Accessibility</Link>
//           </div>
//         </div>
//       </div>
//
//       <div className="pointer-events-none absolute -bottom-[20px] left-0 right-0 h-[180px] bg-[url('/footerMask2.png')] bg-bottom bg-no-repeat bg-[length:100%_100%]" />
//     </footer>
//   );
// }

"use client";

import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ChevronRight,
  Headset,
  ArrowRight,
  Handshake,
  Lightbulb,
  Users,
  Truck,
  FileText,
  CalendarDays,
  UserRound,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";

// ── Content wired to the actual app routes / sections ──────────────────────────
const services = [
  { label: "Full Truckload (FTL)", href: "/services#ftl" },
  { label: "Less Than Truckload (LTL)", href: "/services#ltl" },
  { label: "Dedicated Freight", href: "/services#dedicated" },
  { label: "Special & Heavy Transport", href: "/services#heavy" },
  { label: "Auto Haul", href: "/services#auto" },
  { label: "Courier & Last-Mile Delivery", href: "/services#courier" },
  { label: "Medical Delivery", href: "/services#medics" },
  { label: "Air Freight", href: "/services#air" },
  { label: "Logistics Consulting", href: "/services#consultancy" },
];

const company = [
  { label: "About Us", href: "/llc" },
  { label: "How It Works", href: "/#hiw" },
  { label: "Partner Tiers", href: "/tiers" },
  { label: "Careers", href: "#" },
];

const quickAccess = [
  { label: "Track a Delivery", href: "/access-hub", icon: Truck },
  { label: "Request a Quote", href: "/#quote", icon: FileText },
  { label: "Book a Delivery", href: "/register", icon: CalendarDays },
  { label: "Access Hub", href: "/access-hub", icon: UserRound },
];

const highlights = [
  { label: "Reliable Connections", icon: Handshake },
  { label: "Smarter Solutions", icon: Lightbulb },
  { label: "Stronger Partnerships", icon: Users },
];

const socials = [
  { Icon: FaFacebookF, label: "Facebook", href: "#" },
  { Icon: FaXTwitter, label: "X", href: "#" },
  { Icon: FaLinkedinIn, label: "LinkedIn", href: "#" },
  { Icon: FaInstagram, label: "Instagram", href: "#" },
];

const legal = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Accessibility", href: "#" },
];

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/90">
        {children}
      </h3>
      <span className="mt-3 block h-px w-10 bg-primary" />
    </div>
  );
}

export default function Footer() {
  return (
    <footer id="footer" className="bg-[#0b0b0d] text-white/70">
      {/* Top accent line */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-primary/60 to-transparent" />

      {/* Main columns */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.5fr_1.1fr_0.9fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <Image
              src="/logo_white.svg"
              alt="Logical Links"
              width={150}
              height={64}
              className="mb-6"
            />
            <p className="max-w-xs text-sm leading-relaxed text-white/60">
              Connecting businesses, freight and delivery solutions through
              smarter logistics.
            </p>
            <ul className="mt-8 space-y-4">
              {highlights.map(({ label, icon: Icon }) => (
                <li key={label} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/50 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm text-white/80">{label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <ColumnHeading>Services</ColumnHeading>
            <ul className="space-y-3">
              {services.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="group flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-primary"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-primary" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <ColumnHeading>Company</ColumnHeading>
            <ul className="space-y-3">
              {company.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-primary"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-primary" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick access */}
          <div>
            <ColumnHeading>Quick Access</ColumnHeading>
            <ul className="space-y-4">
              {quickAccess.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="flex items-center gap-3 text-sm text-white/70 transition-colors hover:text-primary"
                  >
                    <span className="text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get in touch */}
          <div>
            <ColumnHeading>Get in Touch</ColumnHeading>
            <ul className="space-y-5 text-sm">
              <li className="flex gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-white/70">
                  123 Logistics Way
                  <br />
                  Toronto, ON M5V 3A8
                </span>
              </li>
              <li className="flex gap-3">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <a
                  href="tel:+18005644225"
                  className="text-white/70 transition-colors hover:text-primary"
                >
                  1-800-LOGICAL
                  <br />
                  (1-800-564-4225)
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <a
                  href="mailto:info@logicallinks.ca"
                  className="text-white/70 transition-colors hover:text-primary"
                >
                  info@logicallinks.ca
                </a>
              </li>
              <li className="flex gap-3">
                <Clock className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-white/70">
                  Mon – Fri: 8:00 AM – 6:00 PM
                  <br />
                  Sat – Sun: Closed
                </span>
              </li>
            </ul>

            <div className="mt-6 flex gap-3">
              {socials.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/40 text-primary transition hover:bg-primary hover:text-[#0b0b0d]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contact-support band */}
      <div className="border-y border-white/10 bg-[#131110]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-primary/50 text-primary">
              <Headset className="h-6 w-6" />
            </span>
            <div>
              <p className="text-lg font-semibold text-primary">
                Need assistance with your logistics needs?
              </p>
              <p className="text-sm text-white/60">
                Our logistics experts are here to help.
              </p>
            </div>
          </div>
          <Link
            href="/contact-support"
            className="inline-flex items-center gap-2 self-start rounded-md bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#0b0b0d] transition hover:bg-primary-dark md:self-auto"
          >
            Contact Support
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 py-6 text-sm text-white/50 lg:flex-row lg:justify-between">
        <p>© 2026 Logical Links Corp. All rights reserved.</p>
        <p className="flex items-center gap-3 text-primary">
          <span className="hidden h-px w-6 bg-primary/50 sm:block" />
          Reliable Connections. Smarter Logistics.
          <span className="hidden h-px w-6 bg-primary/50 sm:block" />
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          {legal.map(({ label, href }, i) => (
            <span key={label} className="flex items-center gap-3">
              {i > 0 && <span className="text-white/20">|</span>}
              <Link
                href={href}
                className="transition-colors hover:text-primary"
              >
                {label}
              </Link>
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}