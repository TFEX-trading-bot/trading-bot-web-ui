// /Users/tung/Desktop/CE Project/trading-bot-web-ui/src/components/Markets.tsx
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function Markets() {
  return (
    <section
      id="market"
      className="py-24 bg-gradient-to-b from-white to-slate-50/50 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          
          {/* ส่วนเนื้อหาฝั่งซ้าย (Left Content) */}
          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                ครอบคลุมตลาดหลัก<br />
                <span className="text-[#6A0DAD]">ของทักลงทุนไทย</span>
              </h2>
              <p className="text-slate-500 text-lg font-medium">
                เข้าถึงโอกาสในการทำกำไรในตลาดที่มีสภาพคล่องสูงที่สุด
              </p>
            </div>

            <div className="space-y-8">
              {/* รายละเอียดตลาด SET50 Index */}
              <div className="flex gap-5 items-start group">
                <div className="mt-1 p-1 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                  <CheckCircle2 className="text-[#6A0DAD] w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">SET50 Index</h3>
                  <p className="text-slate-500 mt-2 font-medium leading-relaxed">
                    คัดเลือกหุ้นพื้นฐานดี 50 ตัวแรกของตลาดหลักทรัพย์ 
                    ระบบจะสแกนหาจังหวะเข้าซื้อในหุ้นรายตัวที่เกิด Trend ชัดเจนโดยอัตโนมัติ
                  </p>
                </div>
              </div>

              {/* รายละเอียดตลาด TFEX */}
              <div className="flex gap-5 items-start group">
                <div className="mt-1 p-1 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors">
                  <CheckCircle2 className="text-amber-500 w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                    TFEX (S50 Futures)
                  </h3>
                  <p className="text-slate-500 mt-2 font-medium leading-relaxed">
                    ทำกำไรได้ทั้งขาขึ้นและขาลง (Long/Short) 
                    เหมาะสำหรับการเก็งกำไรและกระจายความเสี่ยง พร้อมระบบ Stop Loss อัตโนมัติแม่นยำ
                  </p>
                </div>
              </div>
            </div>

            {/* ปุ่มสำหรับดูสถิติ (CTA Button) */}
            <div className="pt-4">
              <a
                href="#"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-50 text-[#6A0DAD] font-black rounded-2xl hover:bg-[#6A0DAD] hover:text-white transition-all duration-300 shadow-sm"
              >
                View Latest Trading Stats <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* ส่วนกราฟิกจำลองฝั่งขวา (Right Decoration - Mock Chart) */}
          <div className="relative">
            {/* องค์ประกอบตกแต่งพื้นหลัง (Blur Circles) */}
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-purple-100/40 rounded-full blur-[80px] z-0"></div>
            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-blue-100/40 rounded-full blur-[80px] z-0"></div>

            {/* หน้าต่างจำลองกราฟ (Mock Chart Window) */}
            <div className="bg-white rounded-[32px] p-8 shadow-[0_20px_60px_rgba(106,13,173,0.12)] border border-slate-100 relative z-10 transition-transform hover:scale-[1.02] duration-500">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-slate-200 rounded-full"></span>
                  <span className="w-3 h-3 bg-slate-200 rounded-full"></span>
                  <span className="w-3 h-3 bg-slate-200 rounded-full"></span>
                </div>
                <div className="px-3 py-1 bg-slate-50 rounded-full text-[10px] text-slate-400 font-black tracking-widest uppercase">
                  Live Terminal
                </div>
              </div>

              {/* แท่งกราฟจำลอง (Mock Chart Bars) */}
              <div className="flex items-end justify-between h-56 gap-2 mb-8">
                <div className="w-full bg-rose-100 rounded-t-lg h-[40%] transition-all duration-1000"></div>
                <div className="w-full bg-rose-200 rounded-t-lg h-[30%]"></div>
                <div className="w-full bg-emerald-100 rounded-t-lg h-[50%]"></div>
                <div className="w-full bg-emerald-200 rounded-t-lg h-[70%] transition-all duration-700"></div>
                <div className="w-full bg-rose-100 rounded-t-lg h-[45%]"></div>
                <div className="w-full bg-emerald-100 rounded-t-lg h-[60%]"></div>
                <div className="w-full bg-emerald-500 rounded-t-lg h-[90%] shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse"></div>
                <div className="w-full bg-emerald-400/60 rounded-t-lg h-[80%]"></div>
              </div>

              {/* แผงข้อมูลสถานะการเทรด (Info Panel) */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                  <p className="text-emerald-600 font-black flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                    LONG POSITION
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unrealized P/L</p>
                  <p className="text-slate-900 font-black text-lg">+12,450 <span className="text-xs">THB</span></p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}