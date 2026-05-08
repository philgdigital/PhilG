"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProjectFormModal } from "@/components/ProjectFormModal";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Advantage } from "@/components/sections/Advantage";
import { ImpactMetrics } from "@/components/sections/ImpactMetrics";
import { Work } from "@/components/sections/Work";
import { Expertise } from "@/components/sections/Expertise";

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Advantage />
        <ImpactMetrics />
        <Work />
        <Expertise />
      </main>
      <Footer onOpenForm={() => setIsFormOpen(true)} />
      <ProjectFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </>
  );
}
