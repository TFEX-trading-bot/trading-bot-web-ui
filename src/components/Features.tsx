// /Users/tung/Desktop/CE Project/trading-bot-web-ui/src/components/Features.tsx
import { Zap, BrainCircuit, BarChart2 } from "lucide-react";

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white relative overflow-hidden">
      {/* Background Decor - เพิ่มจุดวงกลมม่วงจางๆ ด้านข้างเพื่อให้พื้นหลังไม่ดูโล่งเกินไป */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-slate-900 tracking-tight">
            ทำไมต้องใช้ <span className="text-[#6A0DAD]">Trading Bot System?</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
            แก้ปัญหาการเทรดแบบเดิมๆ ด้วยเทคโนโลยีอัจฉริยะที่ช่วยคุมความเสี่ยงและเพิ่มประสิทธิภาพสูงสุด
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-10 rounded-[32px] border border-slate-100 hover:border-purple-200 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(106,13,173,0.1)] group">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#6A0DAD] shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Zap className="w-8 h-8 text-[#6A0DAD] group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-black mb-4 text-slate-800">ความเร็วระดับ Millisecond</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              ระบบส่งคำสั่งซื้อขายเข้าตลาดทันทีที่เกิดสัญญาณ (Signal) 
              ตัดปัญหาความล่าช้าจากฝีมือมนุษย์ ให้คุณได้ราคาที่ต้องการเสมอ
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-10 rounded-[32px] border border-slate-100 hover:border-purple-200 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(106,13,173,0.1)] group">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#6A0DAD] shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <BrainCircuit className="w-8 h-8 text-[#6A0DAD] group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-black mb-4 text-slate-800">ไร้อารมณ์ 100%</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              ขจัดความกลัวและความโลภ บอททำงานตามวินัยและกลยุทธ์อย่างเคร่งครัด 
              ไม่มีการ Panic Sell หรือเข้าเทรดด้วยอารมณ์ชั่ววูบ
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-10 rounded-[32px] border border-slate-100 hover:border-purple-200 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(106,13,173,0.1)] group">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#6A0DAD] shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <BarChart2 className="w-8 h-8 text-[#6A0DAD] group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-black mb-4 text-slate-800">Backtest & Optimization</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              ทุกกลยุทธ์ผ่านการทดสอบย้อนหลังกว่า 10 ปี ในทุกสภาวะตลาด 
              เพื่อให้มั่นใจในสถิติการทำกำไรที่ยั่งยืนในระยะยาว
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}