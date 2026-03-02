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
        ctx.fillStyle = "#6A0DAD"; // เปลี่ยนเป็นม่วงเข้มขึ้นสำหรับพื้นหลังขาว
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
            // ปรับเส้นเชื่อมโยงให้เข้มขึ้นเล็กน้อย (0.15)
            ctx.strokeStyle = `rgba(106, 13, 173, ${0.15 - distance / 1000})`;
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
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 z-0 pointer-events-none opacity-20" // ลด opacity ลงเพื่อให้ดูคลีน
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 rounded-full border border-purple-200 bg-purple-50 mb-8 animate-pulse-slow">
          <span className="w-2 h-2 rounded-full bg-[#6A0DAD] mr-2 shadow-[0_0_10px_rgba(106,13,173,0.5)]"></span>
          <span className="text-[#6A0DAD] text-sm font-semibold tracking-wide uppercase">
            AI Algorithm V.4.0 อัปเดตล่าสุด
          </span>
        </div>

        {/* Heading - ใช้ Slate-900 เพื่อให้ตัดกับพื้นขาว */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight text-slate-900">
          ให้ AI ทำกำไรแทนคุณ <br />
          ในตลาด <span className="gradient-text">SET50 & TFEX</span>
        </h1>

        {/* Description - ใช้ Slate-500 */}
        <p className="mt-4 text-xl text-slate-500 max-w-3xl mx-auto mb-10 font-medium">
          ระบบบอทเทรดอัจฉริยะ วิเคราะห์กราฟเทคนิค Real-time แม่นยำ รวดเร็ว
          และไร้อารมณ์ ช่วยให้คุณสร้าง Cash Flow ได้ตลอด 24 ชั่วโมง
          โดยไม่ต้องเฝ้าหน้าจอ
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={onOpenAuth}
            className="group relative px-8 py-4 bg-[#6A0DAD] hover:bg-[#5D0CA1] text-white text-lg font-bold rounded-2xl shadow-xl shadow-purple-200 transition-all hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
            <span className="flex items-center gap-2">
              เริ่มต้นใช้งานฟรี <ArrowRight className="w-5 h-5" />
            </span>
          </button>
          <a
            href="#how-it-works"
            className="px-8 py-4 bg-white border border-slate-200 hover:border-slate-400 text-slate-600 hover:text-slate-900 text-lg font-bold rounded-2xl transition-all hover:bg-slate-50 flex items-center justify-center shadow-sm"
          >
            ดูวิธีการทำงาน
          </a>
        </div>

        {/* Stats Grid - ปรับสีกรอบและตัวอักษร */}
        <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4 border-t border-slate-100 pt-8">
          <div>
            <div className="text-3xl font-black text-slate-900 mb-1">฿2.5M+</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">กำไรหมุนเวียน/เดือน</div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#6A0DAD] mb-1">98.5%</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Uptime ระบบ</div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 mb-1">1,200+</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">ผู้ใช้งาน Active</div>
          </div>
          <div>
            <div className="text-3xl font-black text-amber-500 mb-1">Top 5</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">กลยุทธ์ทำกำไรสูงสุด</div>
          </div>
        </div>
      </div>
    </section>
  );
}