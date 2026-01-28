// /Users/tung/Desktop/CE Project/trading-bot-web-ui/src/components/Hero.tsx
"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";

interface HeroProps {
  onOpenAuth: () => void;
}

export default function Hero({ onOpenAuth }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas!.width) this.x = 0;
        if (this.x < 0) this.x = canvas!.width;
        if (this.y > canvas!.height) this.y = 0;
        if (this.y < 0) this.y = canvas!.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = "#A545F2";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
      }
    };

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(165, 69, 242, ${0.1 - distance / 1500})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animateParticles);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    initParticles();
    animateParticles();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 z-0 pointer-events-none opacity-40"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 mb-8 animate-pulse-slow">
          <span className="w-2 h-2 rounded-full bg-brand-500 mr-2 shadow-[0_0_10px_#A545F2]"></span>
          <span className="text-brand-500 text-sm font-semibold tracking-wide uppercase">
            AI Algorithm V.4.0 อัปเดตล่าสุด
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
          ให้ AI ทำกำไรแทนคุณ <br />
          ในตลาด <span className="gradient-text">SET50 & TFEX</span>
        </h1>

        <p className="mt-4 text-xl text-gray-400 max-w-3xl mx-auto mb-10 font-light">
          ระบบบอทเทรดอัจฉริยะ วิเคราะห์กราฟเทคนิค Real-time แม่นยำ รวดเร็ว
          และไร้อารมณ์ ช่วยให้คุณสร้าง Cash Flow ได้ตลอด 24 ชั่วโมง
          โดยไม่ต้องเฝ้าหน้าจอ
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={onOpenAuth}
            className="group relative px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white text-lg font-bold rounded-full shadow-xl shadow-brand-500/40 transition-all hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
            <span className="flex items-center gap-2">
              เริ่มต้นใช้งานฟรี <ArrowRight className="w-5 h-5" />
            </span>
          </button>
          <a
            href="#how-it-works"
            className="px-8 py-4 bg-transparent border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white text-lg font-medium rounded-full transition-all hover:bg-gray-800 flex items-center justify-center"
          >
            ดูวิธีการทำงาน
          </a>
        </div>

        {/* Stats Grid */}
        <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4 border-t border-gray-800 pt-8">
          <div>
            <div className="text-3xl font-bold text-white mb-1">฿2.5M+</div>
            <div className="text-sm text-gray-500">กำไรหมุนเวียน/เดือน</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-brand-500 mb-1">98.5%</div>
            <div className="text-sm text-gray-500">Uptime ระบบ</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">1,200+</div>
            <div className="text-sm text-gray-500">ผู้ใช้งาน Active</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-brand-gold mb-1">Top 5</div>
            <div className="text-sm text-gray-500">กลยุทธ์ทำกำไรสูงสุด</div>
          </div>
        </div>
      </div>
    </section>
  );
}
