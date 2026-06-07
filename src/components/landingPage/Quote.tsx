"use client";

import { ShieldCheck, Clock3, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

export default function LogisticsHero() {
  return (
    <section id="quote" className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/quoteBg.svg')" }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
        <div className="grid w-full gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col justify-center text-white"
          >
            <div className="max-w-xl">
              <h1 className="mb-6 text-4xl sm:text-6xl font-bold leading-tight">
                Ready to
                <br />
                Transform Your
                <br />
                Logistics
                <br />
                Operations?
              </h1>

              <p className="mb-12 text-lg text-white/80">
                Join hundreds of businesses that trust Logical Links for their
                delivery needs. Get a custom quote tailored to your specific
                requirements.
              </p>

              <div className="flex flex-wrap gap-8 text-sm text-white/90">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-white" />
                  <span>Instant Quotes</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-white" />
                  <span>Secure &amp; Reliable</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-white" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quote Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex items-center justify-center lg:justify-end"
          >
            <div className="w-full max-w-xl rounded-sm border border-white/30 bg-white/10 p-8 backdrop-blur-xl">
              <p className="text-2xl font-semibold text-white">Get Your Quote</p>
              <p className="mt-2 text-sm text-white/70">
                Fill out the form and we&apos;ll get back to you within 24 hours
              </p>

              <form className="mt-8 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input placeholder="First Name" className="border-white/10 bg-white text-black rounded-xs" />
                  <Input placeholder="Last Name" className="border-white/10 bg-white text-black rounded-xs" />
                </div>
                <Input placeholder="Email Address" type="email" className="border-white/10 bg-white text-black rounded-xs" />
                <Input placeholder="Company Name" className="border-white/10 bg-white text-black rounded-xs" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Input placeholder="Service Type" className="border-white/10 bg-white text-black rounded-xs" />
                  <Input placeholder="Package Volume" className="border-white/10 bg-white text-black rounded-xs" />
                </div>
                <Textarea
                  placeholder="Tell us about your logistics needs..."
                  className="min-h-[120px] border-white/10 bg-white text-black rounded-xs"
                />
                <Button
                  size="lg"
                  className="h-12 w-full bg-primary font-semibold text-white hover:bg-primary-dark rounded-xs"
                >
                  Get My Quote →
                </Button>
                <p className="text-center text-xs text-white/60">
                  By submitting this form, you agree to our terms and privacy policy
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
