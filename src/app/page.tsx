// /Users/tung/Desktop/CE Project/trading-bot-web-ui/src/app/page.tsx
"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Markets from "@/components/Markets";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const openAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <main className="min-h-screen">
      <Navbar onOpenAuth={openAuth} />
      <Hero onOpenAuth={() => openAuth("register")} />
      <Features />
      <Markets />
      <Pricing onOpenAuth={() => openAuth("register")} />
      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        setMode={setAuthMode}
      />
    </main>
  );
}
