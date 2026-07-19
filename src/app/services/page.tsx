"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "@/components/landingPage/Header";
import Footer from "@/components/landingPage/Footer";

interface ServiceBullet {
  title: string;
  description: string;
}

interface ServiceDetail {
  id: string;
  navLabel: string;
  whyHeading: string;
  bullets: ServiceBullet[];
  image: string;
  imageHeading: string;
  paragraphs: string[];
}

const SERVICES: ServiceDetail[] = [
  {
    id: "ftl",
    navLabel: "FTL (Full Truckload)",
    whyHeading: "Why companies rely on our FTL Solutions.",
    bullets: [
      { title: "One Truck. One Focus. Your Freight", description: "The entire load is dedicated to you, no sharing, no distractions." },
      { title: "Faster Transit, Fewer Stops", description: "Direct routes mean quicker deliveries with less risk of delays." },
      { title: "Maximum Control", description: "Your freight stays sealed, untouched, and secure from start to finish." },
      { title: "Scalable Capacity", description: "Whether it's a single truck or a fleet rollout, we deliver without limits." },
      { title: "Powerful Efficiency", description: "One pickup, one delivery—streamlined, straightforward, and cost-effective for larger volumes." },
      { title: "Risk-Free Movement", description: "Minimized handling reduces the chance of damage, ensuring pristine delivery." },
      { title: "Cross-Border Excellence", description: "Smooth, uninterrupted service across Canada, the U.S., and Mexico." },
      { title: "Technology-Driven Visibility", description: "Track every mile in real time with complete shipment transparency." },
      { title: "High-Volume Advantage", description: "The more you move, the more value we create with optimized lanes and bulk efficiency." },
    ],
    image: "/service1.svg",
    imageHeading: "Your Full Load. Our Full Attention.",
    paragraphs: [
      "LLC connects shippers with dependable capacity through a broad carrier network, delivering full truckload services that emphasize speed, security, and cost-efficiency. As a freight broker, we align your shipments with the right equipment and carriers, ensuring every load moves smoothly from pickup to delivery.",
      "Our expertise lies in optimizing routes, negotiating competitive rates, and managing the logistics details so you can focus on your business. With access to dry vans, reefers, flatbeds, and specialized equipment, we create tailored solutions that fit the exact demands of your freight.",
      "Real-time tracking and advanced technology provide visibility across every mile, while our dedicated team ensures proactive communication, reliable performance, and on-time delivery.",
      "With LLC as your logistics partner, your truckload freight is managed with precision, backed by the flexibility and expertise of a trusted freight broker.",
    ],
  },
  {
    id: "ltl",
    navLabel: "LTL (Less Than Truckload)",
    whyHeading: "Why businesses depend on our LTL Services.",
    bullets: [
      { title: "Priority Beyond Size", description: "Even the smallest shipments get treated like mission-critical cargo." },
      { title: "No Space Wasted", description: "We maximize truck efficiency, so you pay only for what you need, never more." },
      { title: "Speed in Small Packages", description: "Our LTL moves are designed to hit tight delivery windows without compromise." },
      { title: "Smart Consolidation", description: "Your freight rides with the best-matched loads, cutting costs while keeping transit times short." },
      { title: "Personalized Attention", description: "Smaller loads mean bigger focus from our team—every detail counts." },
      { title: "Unmatched Flexibility", description: "Perfect for businesses with fluctuating volumes or seasonal spikes." },
      { title: "24/7 Watch", description: "Even a single pallet is monitored around the clock until it reaches its destination." },
      { title: "Eco-Efficient Shipping", description: "Reduce your carbon footprint with smarter load sharing and optimized routes." },
    ],
    image: "/ltl.png",
    imageHeading: "Less Than a Load. More Than a Priority.",
    paragraphs: [
      "LLC delivers flexible and cost-effective Less-Than-Truckload solutions, giving businesses the ability to move smaller shipments without paying for unused trailer space. As a freight broker, we leverage our carrier partnerships to consolidate freight, streamline routing, and secure competitive pricing tailored to your shipping volume.",
      "Our team manages the complexities of LTL—such as multiple stops, shared capacity, and diverse freight types—so you can count on timely, damage-free deliveries. With access to a wide range of carriers across North America, we match your freight to the most efficient and reliable options available.",
      "Using advanced technology, we provide real-time visibility, accurate tracking, and seamless communication, ensuring your shipments are always on schedule. Whether you ship occasionally or on a regular basis, LLC simplifies the LTL process and keeps your supply chain running smoothly.",
      "With us, your smaller loads get the same level of attention, service, and reliability as a full truckload—because every shipment matters.",
    ],
  },
  {
    id: "dedicated",
    navLabel: "Dedicated Freight Services",
    whyHeading: "Why industry leaders depend on our Dedicated Freight Solutions.",
    bullets: [
      { title: "Freight Without Limits", description: "From single routes to nationwide coverage, we scale effortlessly to match your demand." },
      { title: "Zero Downtime Promise", description: "Our systems and planning ensure your freight keeps moving, even when challenges arise." },
      { title: "Cargo Confidence", description: "Every load is safeguarded with advanced monitoring and reinforced security measures." },
      { title: "Borderless Movement", description: "Seamless coordination across borders eliminates delays and keeps supply chains flowing." },
      { title: "Data-Driven Precision", description: "Predictive analytics and intelligent planning keep your freight one step ahead." },
      { title: "Performance Backed by Metrics", description: "Service levels are measured, tracked, and continuously improved to exceed expectations." },
      { title: "Always-On Commitment", description: "Freight doesn't sleep, and neither do we – your business has our attention 24/7." },
      { title: "Future-Ready Solutions", description: "Built on innovation, ensuring your logistics strategy grows with tomorrow's challenges." },
      { title: "Executive-Level Service", description: "Premium freight solutions tailored for leaders who expect nothing short of excellence." },
    ],
    image: "/dfs.jpg",
    imageHeading: "Dedicated to Freight. Dedicated to You.",
    paragraphs: [
      "LLC ensures dependable dedicated freight services built on reliability and adaptability to align with your specific operations.",
      "We understand that every shipment is critical, which is why we combine secure methods, scalable solutions, and advanced technology to deliver a transportation service you can rely on.",
      "Our capabilities are built on a strategically chosen carrier network serving Canada and the U.S., giving you access to consistent capacity and seamless cross-border movement. With real-time tracking and advanced system integrations, we provide complete visibility and peace of mind at every step of your supply chain.",
      "Whether you're a growing business or a large enterprise, we customize solutions to match your operations – optimizing lanes, reducing costs, and improving transit times. With precision and expertise, our logistics team manages all shipments, complemented by round-the-clock support that ensures consistent communication and reliable delivery.",
      "With LLC, your dedicated freight isn't just transported – it's managed with expertise, innovation, and a commitment to keeping your business moving forward.",
    ],
  },
  {
    id: "heavy",
    navLabel: "Special or Heavy Transport",
    whyHeading: "Why companies rely on our Heavy Transport Expertise.",
    bullets: [
      { title: "Force Meets Precision", description: "We have the strength to move massive loads with the accuracy to deliver them flawlessly." },
      { title: "Safety First, Always", description: "Every haul is engineered with strict safety standards to protect your cargo, our crews, and the public." },
      { title: "Fully Compliant, Always", description: "Every move adheres to Canadian and U.S. regulations, ensuring smooth transport without delays or fines." },
      { title: "Permit & Escort Experts", description: "We manage all permits, escorts, and documentation required for oversized hauls." },
      { title: "Specialized Equipment Fleet", description: "From multi-axle trailers to hydraulic systems, we're equipped for what others can't handle." },
      { title: "Oversized Expertise", description: "Proven experience in moving machinery, construction gear, and out-of-gauge cargo securely." },
      { title: "Route Pioneers", description: "Every bridge, turn, and mile is planned for flawless delivery of complex shipments." },
      { title: "Big Loads. Zero Stress", description: "We simplify the impossible and deliver without compromise." },
    ],
    image: "/sht.jpg",
    imageHeading: "Heavy Transport. Handled with Care.",
    paragraphs: [
      "LLC excels in transporting oversized, wide, and heavy cargo with unmatched accuracy and dependability. We handle every detail of your shipment—from planning routes and securing permits to coordinating escorts and selecting the right equipment—while strictly adhering to Canadian transport regulations.",
      "Our fleet includes multi-axle trailers, flatbeds, hydraulic platforms, and specialized rigs, each configured to safely accommodate the weight and dimensions of your freight. Supported by a network of trusted Canadian carriers, we provide consistent capacity, advanced tracking, and full visibility, always giving you complete oversight of your shipment.",
      "No matter the size of your business, we tailor solutions to fit your operational requirements—streamlining routes, cutting unnecessary costs, and improving delivery timelines. Our skilled logistics team supervises every load with care and precision, while our 24/7 support ensures timely communication and smooth delivery around the clock.",
      "With LLC, transporting heavy or specialized freight isn't just logistics—it's a carefully managed process executed with expertise, innovation, and a commitment to delivering your cargo safely and on schedule.",
    ],
  },
  {
    id: "auto",
    navLabel: "Auto Haul",
    whyHeading: "Why businesses trust our Auto Transport Solutions.",
    bullets: [
      { title: "Cars Treated Like Cargo Royalty", description: "From luxury to fleet vehicles, each car rides in first-class condition." },
      { title: "Multi-Car Efficiency", description: "Open or enclosed carriers tailored to single moves or full dealer lots." },
      { title: "Scratch-Free Promise", description: "Rigorous loading, strapping, and inspection standards guarantee pristine delivery." },
      { title: "Nationwide Coverage", description: "Smooth auto moves across provinces, states, or cross-border routes." },
      { title: "Dealer to Driveway", description: "Whether it's commercial fleet transfers or personal vehicle relocations, we deliver without delay." },
      { title: "High-Speed Hauling", description: "Our scheduling ensures cars arrive on time, every time." },
      { title: "Peace of Mind Tracking", description: "Real-time updates let you follow your vehicle from pickup to delivery." },
    ],
    image: "/auto.jpg",
    imageHeading: "Auto Transport. Managed with Precision.",
    paragraphs: [
      "LLC offers comprehensive auto transport solutions that combine safety, speed, and flexibility, ensuring every vehicle arrives on time and in pristine condition. We manage single cars, multi-vehicle shipments, dealership inventories, and fleet transfers, using open or enclosed carriers with GPS tracking and secure loading to guarantee maximum protection.",
      "Every shipment is carefully planned and executed, from route mapping and customized scheduling to loading and delivery, all in compliance with Canadian transport standards. Our fleet is equipped to handle vehicles of all types and sizes, and our network of trusted Canadian carriers provides reliable capacity and full visibility throughout the transport process.",
      "Whether you require local transport or coordinated long-distance moves, we tailor solutions to your specific needs—optimizing routes, reducing costs, and ensuring efficiency. Our experienced logistics team oversees every vehicle with precision, and with 24/7 availability, we are ready to manage your auto hauling needs anytime, anywhere.",
      "With LLC, vehicle transport isn't just logistics—it's a carefully managed service executed with expertise, care, and an unwavering commitment to safety, timeliness, and client satisfaction.",
    ],
  },
  {
    id: "courier",
    navLabel: "RUHSH | Courier",
    whyHeading: "Why clients depend on RUHSH | Courier.",
    bullets: [
      { title: "From Desk to Doorstep", description: "We handle everything from small parcels to critical documents with urgency." },
      { title: "Same-Day Speed", description: "When tomorrow is too late, we deliver today." },
      { title: "Urban Efficiency", description: "Designed to thrive in fast-paced city environments with zero downtime." },
      { title: "White-Glove Handling", description: "Fragile or high-value packages receive premium-level care." },
      { title: "Network Power", description: "Local, regional, and national reach to cover every corner." },
      { title: "Always on Time", description: "Precision routing ensures consistent delivery windows." },
      { title: "Reliability Redefined", description: "Because a missed courier delivery is never an option." },
    ],
    image: "/courier.png",
    imageHeading: "Courier Service. On Time, Every Time.",
    paragraphs: [
      "LLC delivers fast, secure, and fully managed courier solutions designed to keep your business moving without delay. For urgent and time-sensitive deliveries, our services provide same-day, next-day, and scheduled options, giving you the flexibility to meet any deadline with confidence.",
      "We handle parcels, documents, high-value items, and confidential shipments with the highest level of care and reliability. Every delivery is supported by advanced tracking, real-time updates, and proof-of-delivery, ensuring full visibility and peace of mind from pickup to drop-off.",
      "Our dedicated fleet and trusted partners are equipped to manage everything from small parcels to bulk courier loads with precision and consistency. Whether you need a one-time urgent delivery or ongoing scheduled routes, we design solutions that optimize efficiency, reduce costs, and maintain strict reliability standards.",
      "Always on call, our team is available day and night to coordinate, support, and execute your deliveries whenever needed. With LLC, courier service isn't just about moving items—it's a seamless, stress-free experience built on speed, security, and trust.",
    ],
  },
  {
    id: "tasker",
    navLabel: "RUHSH | Tasker",
    whyHeading: "Why clients count on RUHSH | Tasker",
    bullets: [
      { title: "Personal Shopping, Tailored with Care", description: "Skip the wait—we handle your errands with speed and precision." },
      { title: "From Groceries to Dining", description: "Fresh pantry staples, last-minute restaurant pick-ups, or specialty items—we deliver it all, fast." },
      { title: "Trusted Accuracy", description: "Every order is double-checked, so you get exactly what you need, when you need it." },
      { title: "Priority Service", description: "Urgent requests and hard-to-find items are managed quickly and seamlessly." },
      { title: "Effortless Convenience", description: "Shopped, picked up, and delivered—without you lifting a finger." },
    ],
    image: "/tasker.png",
    imageHeading: "RUHSH Tasker. Ready When You Are.",
    paragraphs: [
      "RUSH Tasker delivers personal shopping solutions designed for speed, precision, and reliability—ensuring every order is managed exactly the way you need it. From groceries and restaurant pick-ups to luxury goods and urgent essentials, we combine efficiency with attention to detail, so nothing is ever missed.",
      "Whether it's a one-time request or ongoing support, every shopping experience is tailored to your schedule, preferences, and lifestyle. Our team manages everything – sourcing, pickup, and swift delivery – so you can stay focused on your priorities while we handle the rest.",
      "With real-time tracking, status updates, and flexible scheduling, you remain in control from start to finish. We adapt to your timeline, your pace, and your requirements – delivering not only what you want, but exactly when you need it.",
      "With RUSH Tasker, personal shopping goes beyond convenience – it's a trusted service built on speed, care, and dependability, designed to make your life simpler every step of the way.",
    ],
  },
  {
    id: "medics",
    navLabel: "RUHSH | Medics",
    whyHeading: "Why healthcare providers trust our deliveries.",
    bullets: [
      { title: "Life-First Logistics", description: "Every shipment is treated with urgency because lives may depend on it." },
      { title: "Temperature Assurance", description: "Cold-chain technology safeguards sensitive medications and biologics." },
      { title: "Sterile Standards", description: "Strict handling protocols prevent contamination or compromise." },
      { title: "Regulatory Expertise", description: "Fully compliant with healthcare transport laws and certifications." },
      { title: "24/7 Availability", description: "Medical emergencies don't wait — neither do we." },
      { title: "Critical Accuracy", description: "Zero room for error, guaranteed precision from pickup to delivery." },
      { title: "Trusted by Healthcare Leaders", description: "Hospitals, labs, and clinics rely on us as their supply chain lifeline." },
    ],
    image: "/medics.jpg",
    imageHeading: "Trusted Care in Every Delivery.",
    paragraphs: [
      "LLC delivers medical supply solutions built on precision, urgency, and trust—ensuring critical items reach their destination exactly when they're needed most. From pharmaceuticals and lab samples to hospital equipment and essential healthcare materials, we manage every delivery with the highest level of safety, security, and compliance.",
      "Whether it's one-time urgent shipments or recurring scheduled deliveries, our service adapts to the specific requirements of healthcare providers, pharmacies, laboratories, and clinics. We handle pickup, secure transport, and timely drop-off, all while maintaining strict chain-of-custody standards to guarantee accuracy and reliability.",
      "Every shipment is supported by advanced tracking, real-time updates, and proof of delivery, giving you complete visibility and peace of mind. With flexible scheduling and rapid response options, we make sure your supplies are delivered on time, every time.",
      "Our team is always ready to serve, ensuring around-the-clock availability for critical and time-sensitive needs. With LLC, medical supply delivery isn't just a service—it's a lifeline managed with care, urgency, and an unwavering commitment to supporting healthcare operations.",
    ],
  },
  {
    id: "air",
    navLabel: "RUHSH | Air",
    whyHeading: "Why companies rely on our Air Transport.",
    bullets: [
      { title: "Speed Without Borders", description: "Fastest possible transit times for global shipments." },
      { title: "Worldwide Network", description: "Access to major carriers and air hubs across continents." },
      { title: "Customs Simplified", description: "We navigate complex clearance processes with ease." },
      { title: "Emergency Ready", description: "Priority lift for urgent, time-sensitive cargo." },
      { title: "High-Security Handling", description: "Cargo is protected at every touchpoint, in air and on ground." },
      { title: "Flexible Options", description: "Consolidated or chartered flights to fit your budget and timeline." },
      { title: "Global Reach. Local Care.", description: "Your shipment may cross oceans, but it never leaves our attention." },
    ],
    image: "/air.png",
    imageHeading: "Air Freight. Elevated.",
    paragraphs: [
      "LLC redefines air freight with a premium, executive-grade service designed to meet the demands of the aerospace and high-value industries. In a world where every hour can cost millions, we deliver time-sensitive cargo with absolute precision, unmatched reliability, and a level of control that inspires confidence at every stage.",
      "From aircraft parts and urgent AOG (Aircraft on Ground) shipments to delicate, high-value components, we design tailored solutions that ensure zero downtime for your operations. Our global air network, combined with priority access to leading carriers and charter services, guarantees capacity when and where you need it—without compromise.",
      "Every detail is meticulously managed—customs clearance, regulatory compliance, cargo security, and multimodal integration—ensuring your freight moves seamlessly across borders and continents. Advanced tracking systems and live data analytics give you real-time visibility, while our command-center approach ensures proactive problem-solving before issues arise.",
      "With LLC, you don't just book an air freight service—you secure a strategic partner dedicated to keeping your aerospace supply chain resilient, responsive, and future-ready. Our logistics experts are available day and night, providing direct access, immediate answers, and tailored solutions that move as fast as your business demands.",
      "For aerospace leaders who demand nothing less than certainty, LLC offers more than air freight. We deliver assurance, performance, and a partnership built to elevate your operations beyond industry standards.",
    ],
  },
  {
    id: "transporter",
    navLabel: "RUHSH | Transporter",
    whyHeading: "Why riders choose RUHSH | Transporter.",
    bullets: [
      { title: "Ride in Prestige", description: "Every journey feels like a VIP experience." },
      { title: "Professional Drivers", description: "Trained, discreet, and committed to exceptional service." },
      { title: "Luxury Fleet Options", description: "Sedans, SUVs, and executive vehicles tailored to your style." },
      { title: "Always On Time", description: "Reliability that ensures you never miss a meeting or event." },
      { title: "Safety Above All", description: "Vehicles maintained to the highest safety standards." },
      { title: "Seamless Convenience", description: "Effortless booking and personalized ride arrangements." },
      { title: "Redefining Comfort", description: "Where punctuality meets pure sophistication." },
    ],
    image: "/trans.jpg",
    imageHeading: "Every Ride. Exceptional.",
    paragraphs: [
      "LLC Chauffeur Services delivers more than transportation—we provide a premium travel experience defined by professionalism, comfort, and reliability. Whether for executives, VIPs, or personal engagements, our service is designed to meet the highest standards of safety, discretion, and convenience.",
      "From airport transfers and corporate travel to private events and long-distance journeys, we tailor each ride to your schedule and expectations. Our fleet of modern, luxury vehicles is maintained to the highest standards and equipped with the latest technology to ensure a smooth, comfortable journey every time.",
      "Every trip is managed by skilled, courteous chauffeurs who are trained to provide both precision driving and exceptional customer service. Punctuality is our promise, and flexibility is at the core of our operations—ensuring that your travel adapts seamlessly to last-minute changes or urgent requests.",
      "Clients receive real-time updates, professional coordination, and on-demand availability, guaranteeing peace of mind for both planned and unplanned travel needs. With LLC, chauffeur service is more than point-to-point driving—it's a trusted partnership built on consistency, care, and an unwavering commitment to excellence.",
    ],
  },
  {
    id: "consultancy",
    navLabel: "Consultancy & Advisory Services",
    whyHeading: "Why companies turn to our Expertise.",
    bullets: [
      { title: "Proven Expertise", description: "Our team brings years of hands-on experience in logistics, supply chain, and operational strategy." },
      { title: "Tailored Solutions", description: "Every recommendation is customized to your business, ensuring maximum efficiency and measurable results." },
      { title: "End-to-End Support", description: "From analysis to implementation, we guide you through every step of the process." },
      { title: "Compliance Confidence", description: "Strategies are designed with full adherence to industry regulations, minimizing risk." },
      { title: "Data-Driven Decisions", description: "Insights backed by advanced analytics and real-time operational data." },
      { title: "Scalable Advice", description: "Solutions that grow with your business, supporting both small operations and large enterprises." },
      { title: "Innovation at Core", description: "We identify opportunities for process improvement, cost reduction, and operational excellence." },
      { title: "Trusted Partnership", description: "We don't just advise—we work as an extension of your team, fully committed to your success." },
      { title: "Flexible Availability", description: "Our experts are accessible when you need them, ready to address urgent challenges or long-term planning." },
    ],
    image: "/adv.png",
    imageHeading: "Complex Challenges. Solved with Expertise.",
    paragraphs: [
      "LLC is a full-service Logistics & Transport Solutions company, delivering tailored, reliable, and innovative services for businesses and individuals. From freight management and courier delivery to medical transport, personal shopping, and chauffeur services, we provide seamless solutions designed to keep operations moving efficiently.",
      "Building on our hands-on expertise, LLC also offers Consultancy & Advisory Services, helping clients optimize supply chains, improve delivery efficiency, manage compliance, and reduce operational costs. By combining practical logistics experience with strategic insight, we empower businesses to make smarter decisions, streamline operations, and achieve measurable results.",
      "With flexible solutions and expert guidance, LLC is more than a service provider—it's a trusted partner committed to operational excellence, innovation, and client success.",
    ],
  },
];

type NavEntry =
  | { kind: "link"; id: string }
  | { kind: "group"; label: string; children: string[] };

const NAV_STRUCTURE: NavEntry[] = [
  { kind: "link", id: "ftl" },
  { kind: "link", id: "ltl" },
  { kind: "link", id: "dedicated" },
  { kind: "link", id: "heavy" },
  { kind: "link", id: "auto" },
  {
    kind: "group",
    label: "RUHSH Services",
    children: ["courier", "tasker", "medics", "air", "transporter"],
  },
  { kind: "link", id: "consultancy" },
];

const SERVICE_MAP = Object.fromEntries(
  SERVICES.map((service) => [service.id, service]),
);

export default function ServicesPage() {
  const [activeId, setActiveId] = useState<string>("ftl");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && SERVICE_MAP[hash]) {
      setActiveId(hash);
    }
  }, []);

  function selectService(id: string) {
    setActiveId(id);
    window.history.replaceState(null, "", `#${id}`);
  }

  const active = SERVICE_MAP[activeId];

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
            Our
            <br className="hidden sm:block" />{" "}
            <span className="text-primary">Services</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="text-base sm:text-xl font-medium text-gray-600 max-w-xl"
          >
            Explore our transportation and delivery solutions designed to
            support businesses of all sizes.
          </motion.p>
        </section>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 w-full">
        <div className="overflow-x-clip rounded-2xl bg-[#FBF3E5] p-4 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[240px_1fr_1fr] lg:gap-10">
            {/* Nav column — sits on top like a book cover, overlapping the
                "why" column so its content can slide out from underneath it */}
            <nav className="relative z-20 flex gap-1 overflow-x-auto rounded-2xl bg-white p-3 shadow-[6px_0_24px_-8px_rgba(0,0,0,0.18)] pb-2 lg:flex-col lg:overflow-visible lg:p-4 lg:pb-4 lg:mr-[-2.5rem] lg:pr-10">
              {NAV_STRUCTURE.map((entry, i) =>
                entry.kind === "link" ? (
                  <NavLink
                    key={entry.id}
                    label={SERVICE_MAP[entry.id].navLabel}
                    active={activeId === entry.id}
                    onClick={() => selectService(entry.id)}
                  />
                ) : (
                  <div key={`group-${i}`} className="shrink-0 lg:shrink lg:mt-1">
                    <p className="whitespace-nowrap px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 lg:whitespace-normal">
                      {entry.label}
                    </p>
                    <div className="flex gap-1 lg:flex-col">
                      {entry.children.map((id) => (
                        <NavLink
                          key={id}
                          label={SERVICE_MAP[id].navLabel}
                          active={activeId === id}
                          onClick={() => selectService(id)}
                          indent
                        />
                      ))}
                    </div>
                  </div>
                ),
              )}
            </nav>

            {/* Why column — pulled out from behind the nav "book cover" */}
            <motion.div
              key={`${active.id}-why`}
              initial={{ x: -56, opacity: 0, rotate: -2 }}
              animate={{ x: 0, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: "top left" }}
              className="relative z-10 rounded-2xl bg-white p-6 shadow-md lg:pl-12"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-primary mb-6">
                {active.whyHeading}
              </h2>

              <div className="space-y-4">
                {active.bullets.map((bullet) => (
                  <div key={bullet.title}>
                    <p className="text-sm font-semibold text-black">
                      {bullet.title}:
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {bullet.description}
                    </p>
                  </div>
                ))}
              </div>

              <Link
                href="/#quote"
                className="mt-8 inline-block rounded-full bg-primary px-8 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-primary-dark"
              >
                Get a Quote
              </Link>
            </motion.div>

            {/* Image + description column */}
            <motion.div
              key={`${active.id}-detail`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
              className="rounded-2xl bg-white p-6 shadow-lg"
            >
              <div className="relative aspect-[1.4] overflow-hidden rounded-lg">
                <Image
                  src={active.image}
                  alt={active.navLabel}
                  fill
                  className="object-cover"
                />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-primary">
                {active.imageHeading}
              </h3>

              <div className="mt-3 space-y-3">
                {active.paragraphs.map((paragraph, i) => (
                  <p key={i} className="text-sm text-gray-600 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function NavLink({
  label,
  active,
  onClick,
  indent,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  indent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition-colors lg:whitespace-normal ${
        indent ? "lg:pl-6" : ""
      } ${
        active
          ? "font-semibold text-primary"
          : "text-gray-700 hover:text-primary"
      }`}
    >
      {label}
    </button>
  );
}
