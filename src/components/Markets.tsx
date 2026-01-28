// /Users/tung/Desktop/CE Project/trading-bot-web-ui/src/components/Markets.tsx
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function Markets() {
  return (
    <section
      id="market"
      className="py-20 bg-gradient-to-b from-brand-card to-brand-dark"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              ครอบคลุมตลาดหลัก<br />ของนักลงทุนไทย
            </h2>

            <div className="flex gap-4 items-start">
              <div className="mt-1">
                <CheckCircle2 className="text-brand-500 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">SET50 Index</h3>
                <p className="text-gray-400 mt-1">
                  คัดเลือกหุ้นพื้นฐานดี 50 ตัวแรก
                  ระบบจะสแกนหาจังหวะเข้าซื้อในหุ้นรายตัวที่เกิด Trend ชัดเจน
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="mt-1">
                <CheckCircle2 className="text-brand-gold w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  TFEX (S50 Futures)
                </h3>
                <p className="text-gray-400 mt-1">
                  ทำกำไรได้ทั้งขาขึ้นและขาลง (Long/Short)
                  เหมาะสำหรับการเก็งกำไรระยะสั้นและกลาง พร้อมระบบ Stop Loss
                  อัตโนมัติ
                </p>
              </div>
            </div>

            <div className="pt-6">
              <a
                href="#"
                className="text-brand-500 font-semibold hover:text-brand-400 flex items-center gap-2"
              >
                ดูสถิติผลการเทรดล่าสุด <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="relative">
            {/* Mock Chart Decoration */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 shadow-2xl relative z-10">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  LIVE TRADING VIEW
                </div>
              </div>
              {/* Mock chart bars */}
              <div className="flex items-end justify-between h-48 gap-1">
                <div className="w-full bg-red-500/20 rounded-t h-[40%]"></div>
                <div className="w-full bg-red-500/40 rounded-t h-[30%]"></div>
                <div className="w-full bg-green-500/30 rounded-t h-[50%]"></div>
                <div className="w-full bg-green-500/60 rounded-t h-[70%]"></div>
                <div className="w-full bg-red-500/30 rounded-t h-[45%]"></div>
                <div className="w-full bg-green-500/50 rounded-t h-[60%]"></div>
                <div className="w-full bg-green-500 rounded-t h-[85%] animate-pulse"></div>
                <div className="w-full bg-green-500/80 rounded-t h-[75%]"></div>
              </div>
              <div className="mt-4 flex justify-between text-sm">
                <div className="text-gray-400">
                  Position: <span className="text-green-500 font-bold">LONG</span>
                </div>
                <div className="text-gray-400">
                  P/L:{" "}
                  <span className="text-green-500 font-bold">+12,450 THB</span>
                </div>
              </div>
            </div>
            {/* Decorative blur */}
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-brand-500/20 rounded-full blur-[100px] z-0"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
