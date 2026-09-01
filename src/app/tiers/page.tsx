"use client";

import { Award, Check, Clock3 } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/landingPage/Header";
import Footer from "@/components/landingPage/Footer";
import { useTiers } from "@/hooks/use-tiers";
import { cn } from "@/lib/utils";

export default function TiersPage() {
  const { data, isLoading } = useTiers();
  const tiers = data?.data ?? [];

  return (
    <div className="landing-page min-h-screen bg-white flex flex-col">
      <div className="bg-[url('/hero2.png')] bg-cover bg-center pt-10">

      {/* <div className="bg-[url('/hero3.webp')] bg-cover bg-center pt-10"> */}
        <Header />

        <section className="max-w-6xl mx-auto pt-32 pb-20 px-6 text-start">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-3xl sm:text-6xl text-black font-bold leading-tight mb-6 uppercase"
          >
            Partner
            <br className="hidden sm:block" />{" "}
            <span className="text-primary">Tiers</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="text-base sm:text-xl font-medium text-black max-w-xl"
          >
            The more you ship with us, the more you unlock. Every tier builds
            on the one before it.
          </motion.p>
        </section>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20 w-full">
        {isLoading ? (
          <div className="space-y-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-xs bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {tiers.map((tier, i) => {
              const previous = tiers.find((t) => t.rank === tier.rank - 1);
              return (
                <motion.div
                  key={tier.tier_id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                  className={cn(
                    "rounded-xs border p-8 shadow-sm",
                    tier.rank === tiers.length
                      ? "border-primary/30 bg-primary/5"
                      : "border-gray-100",
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Award className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-black">{tier.name}</h2>
                        <p className="mt-0.5 text-sm text-black">
                          {previous
                            ? `Includes everything in ${previous.name}, plus:`
                            : "Baseline access for every shipping partner"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-1.5 text-xs font-semibold text-black">
                      <Clock3 className="h-3.5 w-3.5" />
                      Quote turnaround: {tier.quote_turnaround}
                    </div>
                  </div>

                  <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                    {tier.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-black">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
