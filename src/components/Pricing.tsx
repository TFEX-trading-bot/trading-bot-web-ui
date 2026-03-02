// /Users/tung/Desktop/CE Project/trading-bot-web-ui/src/components/Pricing.tsx
import { Check } from "lucide-react";

interface PricingProps {
  onOpenAuth: () => void;
}

export default function Pricing({ onOpenAuth }: PricingProps) {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-slate-900 tracking-tight">
            เลือกแผนการลงทุน <span className="text-[#6A0DAD]">ของคุณ</span>
          </h2>
          <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">
            เริ่มต้นได้ง่ายๆ ตามขนาดพอร์ตและความต้องการของคุณ
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          
          {/* Starter */}
          <div className="bg-white p-10 rounded-[32px] border border-slate-100 flex flex-col hover:border-purple-200 transition-all duration-300 hover:shadow-xl group">
            <h3 className="text-xl font-bold text-slate-400 mb-2 group-hover:text-slate-600 transition-colors">Starter</h3>
            <div className="my-6">
              <span className="text-5xl font-black text-slate-900">ฟรี</span>
              <span className="text-slate-400 font-medium"> / เดือนแรก</span>
            </div>
            <p className="text-slate-500 font-medium mb-8">
              สำหรับผู้เริ่มต้นที่ต้องการทดสอบประสิทธิภาพของระบบ
            </p>
            <ul className="space-y-5 mb-10 flex-1">
              <li className="flex items-center gap-3 text-slate-600 font-medium text-sm">
                <div className="p-1 bg-purple-50 rounded-full text-[#6A0DAD]"><Check size={14} /></div>
                บอทเทรด SET50
              </li>
              <li className="flex items-center gap-3 text-slate-600 font-medium text-sm">
                <div className="p-1 bg-purple-50 rounded-full text-[#6A0DAD]"><Check size={14} /></div>
                สัญญาณ Delay 15 นาที
              </li>
              <li className="flex items-center gap-3 text-slate-600 font-medium text-sm">
                <div className="p-1 bg-purple-50 rounded-full text-[#6A0DAD]"><Check size={14} /></div>
                แจ้งเตือนผ่าน LINE
              </li>
            </ul>
            <button
              onClick={onOpenAuth}
              className="w-full py-4 rounded-2xl border-2 border-[#6A0DAD] text-[#6A0DAD] hover:bg-[#6A0DAD] hover:text-white transition-all font-bold active:scale-95"
            >
              ทดลองใช้ฟรี
            </button>
          </div>

          {/* Pro (Popular) */}
          <div className="bg-white p-10 rounded-[32px] border-2 border-[#6A0DAD] flex flex-col relative transform md:-translate-y-4 shadow-[0_20px_50px_rgba(106,13,173,0.15)] z-10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#6A0DAD] to-[#9333EA] text-white text-xs font-black px-5 py-2 rounded-full tracking-widest shadow-lg">
              MOST POPULAR
            </div>
            <h3 className="text-xl font-bold text-[#6A0DAD] mb-2">Professional</h3>
            <div className="my-6">
              <span className="text-5xl font-black text-slate-900">฿1,590</span>
              <span className="text-slate-400 font-medium"> / เดือน</span>
            </div>
            <p className="text-slate-500 font-medium mb-8">
              แพลนยอดนิยมสำหรับนักลงทุนที่ต้องการกำไรอย่างจริงจัง
            </p>
            <ul className="space-y-5 mb-10 flex-1">
              <li className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                <div className="p-1 bg-[#6A0DAD] rounded-full text-white shadow-sm"><Check size={14} /></div>
                บอทเทรด TFEX + SET50
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                <div className="p-1 bg-[#6A0DAD] rounded-full text-white shadow-sm"><Check size={14} /></div>
                สัญญาณ Real-time (0s delay)
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                <div className="p-1 bg-[#6A0DAD] rounded-full text-white shadow-sm"><Check size={14} /></div>
                ระบบ Auto-Trade เชื่อมพอร์ต
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                <div className="p-1 bg-[#6A0DAD] rounded-full text-white shadow-sm"><Check size={14} /></div>
                Exclusive Dashboard
              </li>
            </ul>
            <button
              onClick={onOpenAuth}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#6A0DAD] to-[#4B0082] text-white hover:opacity-90 transition-all font-bold shadow-lg shadow-purple-200 active:scale-95"
            >
              เริ่มต้นใช้งานทันที
            </button>
          </div>

          {/* Elite */}
          <div className="bg-white p-10 rounded-[32px] border border-slate-100 flex flex-col hover:border-amber-200 transition-all duration-300 hover:shadow-xl group">
            <h3 className="text-xl font-bold text-amber-500 mb-2 group-hover:text-amber-600 transition-colors text-right">Elite Fund</h3>
            <div className="my-6 text-right">
              <span className="text-3xl font-black text-slate-900 italic uppercase">Profit Sharing</span>
            </div>
            <p className="text-slate-500 font-medium mb-8 text-right">
              บริการพิเศษสำหรับพอร์ตขนาดใหญ่ 10M+ ดูแลโดยผู้เชี่ยวชาญ
            </p>
            <ul className="space-y-5 mb-10 flex-1">
              <li className="flex items-center justify-end gap-3 text-slate-600 font-medium text-sm">
                กลยุทธ์ Private Fund เฉพาะตัว
                <div className="p-1 bg-amber-50 rounded-full text-amber-500"><Check size={14} /></div>
              </li>
              <li className="flex items-center justify-end gap-3 text-slate-600 font-medium text-sm">
                Personal Manager ดูแลส่วนตัว
                <div className="p-1 bg-amber-50 rounded-full text-amber-500"><Check size={14} /></div>
              </li>
              <li className="flex items-center justify-end gap-3 text-slate-600 font-medium text-sm">
                API ความเร็วสูงพิเศษ Latency ต่ำ
                <div className="p-1 bg-amber-50 rounded-full text-amber-500"><Check size={14} /></div>
              </li>
            </ul>
            <button className="w-full py-4 rounded-2xl border-2 border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900 transition-all font-bold active:scale-95">
              ติดต่อสอบถามข้อมูล
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}