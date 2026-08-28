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

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { MapPin, Phone, Mail } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";
import { motion } from "framer-motion";

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();

  const goToSection = (section: string) => {
    if (pathname === "/") {
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/#${section}`);
    }
  };

  return (
    <footer
      id="footer"
      className="relative overflow-hidden bg-primary text-white"
    >
      <div className="absolute inset-0">
        <Image
          src="/f.svg"
          alt="Warehouse"
          fill
          className="object-cover opacity-20"
        />
      </div>
      <div className="absolute inset-0 bg-primary/90" />

      <div className="relative z-10 mx-auto max-w-6xl py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="grid gap-12 lg:gap-16 lg:grid-cols-[1.4fr_1fr_1fr]"
        >
          {/* Left */}
          <div>
            <Image
              src="/logo_white.svg"
              alt="Logical Links"
              width={100}
              height={100}
              className="mb-8"
            />
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
              <button
                type="button"
                onClick={() => goToSection("about")}
                className="text-left hover:underline"
              >
                About Us
              </button>
              <Link href="#">Careers</Link>
              <Link href="#">News &amp; Updates</Link>
              <Link href="#">Case Studies</Link>
              <Link href="/tiers">Partner Tiers</Link>
              <button
                type="button"
                onClick={() => goToSection("quote")}
                className="text-left hover:underline"
              >
                Contact
              </button>
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
              {[FaFacebookF, FaXTwitter, FaLinkedinIn, FaInstagram].map(
                (Icon, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label="Social media"
                    className="flex p-2 items-center justify-center rounded-sm border bg-white/20 backdrop-blur-xs border-white/40 transition hover:bg-white hover:text-primary"
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                ),
              )}
            </div>
          </div>
        </motion.div>

        <div className="my-5 h-px bg-white/20" />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between pb-[60px]">
          <p className="text-white/90 text-sm">
            © 2026 Logical Links. All rights reserved.
          </p>
          <div className="flex gap-8 text-white/90 text-sm">
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
            <Link href="#">Accessibility</Link>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute -bottom-[20px] left-0 right-0 h-[180px] bg-[url('/footerMask2.png')] bg-bottom bg-no-repeat bg-[length:100%_100%]" />
    </footer>
  );
}