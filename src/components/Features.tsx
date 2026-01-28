// /Users/tung/Desktop/CE Project/trading-bot-web-ui/src/components/Features.tsx
import { Zap, BrainCircuit, BarChart2 } from "lucide-react";

export default function Features() {
  return (
    <section id="features" className="py-20 bg-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ทำไมต้องใช้ <span className="text-brand-500">Trading Bot System?</span>
          </h2>
          <p className="text-gray-400">
            แก้ปัญหาการเทรดแบบเดิมๆ ด้วยเทคโนโลยีที่เหนือกว่า
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-brand-card p-8 rounded-2xl border border-gray-700 hover:border-brand-500 transition-all hover:shadow-2xl hover:shadow-brand-500/10 group">
            <div className="w-14 h-14 bg-brand-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-500 transition-colors">
              <Zap className="w-8 h-8 text-brand-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold mb-3">ความเร็วระดับ Millisecond</h3>
            <p className="text-gray-400 font-light">
              ระบบส่งคำสั่งซื้อขายเข้าตลาดทันทีที่เกิดสัญญาณ (Signal)
              ตัดปัญหาการส่งคำสั่งไม่ทันราคาที่ต้องการ
            </p>
          </div>

          <div className="bg-brand-card p-8 rounded-2xl border border-gray-700 hover:border-brand-500 transition-all hover:shadow-2xl hover:shadow-brand-500/10 group">
            <div className="w-14 h-14 bg-brand-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-500 transition-colors">
              <BrainCircuit className="w-8 h-8 text-brand-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold mb-3">ไร้อารมณ์ 100%</h3>
            <p className="text-gray-400 font-light">
              ขจัดความกลัวและความโลภ บอททำงานตามวินัยและแผนที่วางไว้อย่างเคร่งครัด
              ไม่มีการ Panic Sell
            </p>
          </div>

          <div className="bg-brand-card p-8 rounded-2xl border border-gray-700 hover:border-brand-500 transition-all hover:shadow-2xl hover:shadow-brand-500/10 group">
            <div className="w-14 h-14 bg-brand-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-500 transition-colors">
              <BarChart2 className="w-8 h-8 text-brand-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold mb-3">Backtest & Optimization</h3>
            <p className="text-gray-400 font-light">
              กลยุทธ์ผ่านการทดสอบย้อนหลังกว่า 10 ปี ในสภาวะตลาดที่หลากหลาย
              เพื่อให้มั่นใจในค่า Expectancy ที่เป็นบวก
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
