"use client";

import { useRef } from "react";
import { useScroll, useTransform } from "framer-motion";
import Header from "./components/Header"
import Hero from "./components/Hero";
import { Problem } from "./components/Problem";
import HowItWorks from "./components/HowItWorks";
import Blog from "./components/Blog";
import { DemoTerminal } from "./components/DemoTerminal";
import { FAQSection } from "./components/FAQ";
import CTABanner from "./components/CTABanner";
import Footer from "./components/Footer";

export default function SendraPage() {
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroScroll, [0, 1], [0, -55]);
  const heroOpacity = useTransform(heroScroll, [0, 0.65], [1, 0]);

  return (
    <main className="relative min-h-screen text-white overflow-x-hidden"
      style={{ background: "linear-gradient(180deg, #06060a 0%, #080810 25%, #07070c 55%, #060608 100%)" }}>

      <Header />

      <Hero heroRef={heroRef} heroY={heroY} heroOpacity={heroOpacity} />

      <Problem />

      <HowItWorks />

      <Blog />

      <DemoTerminal />

      <FAQSection />

      <CTABanner />

      <Footer />

    </main>
  );
}
