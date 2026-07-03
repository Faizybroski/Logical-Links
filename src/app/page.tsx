"use client";

import Link from "next/link";
import Image from "next/image";
import LandingAuthRedirect from "@/components/layout/LandingAuthRedirect";
import Header from "@/components/landingPage/Header";
import Hero from "@/components/landingPage/Hero";
import About from "@/components/landingPage/About";
import HIW from "@/components/landingPage/HIW";
import Testimonials from "@/components/landingPage/Testimonials";
import Tracking from "@/components/landingPage/Tracking";
import Offerings from "@/components/landingPage/Offerings";
import Services from "@/components/landingPage/Services";
import Technologies from "@/components/landingPage/Techonologies";
import Quote from "@/components/landingPage/Quote";
import Milestones from "@/components/landingPage/Milestones";
import Footer from "@/components/landingPage/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingAuthRedirect />
      <div className="text-center bg-primary text-white py-2 text-xs">
        <span className="underline">Important Note:</span>{" "}
        <span>if you completely feel secure then transfer your shipment.</span>
      </div>
      <div className="bg-[url('/hero.png')] bg-cover bg-center pt-10">
        <Header />
        <Hero />
      </div>
      {/* <Tracking /> */}
      <About />
      <HIW />
      <Services />
      {/* <Technologies /> */}
      <Offerings />
      {/* <Milestones /> */}
      <Quote />
      <Testimonials />
      <Footer />
    </div>
  );
}
