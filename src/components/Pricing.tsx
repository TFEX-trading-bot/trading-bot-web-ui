// /Users/tung/Desktop/CE Project/trading-bot-web-ui/src/components/Pricing.tsx
import { Check } from "lucide-react";

interface PricingProps {
  onOpenAuth: () => void;
}

export default function Pricing({ onOpenAuth }: PricingProps) {
  return (
    <section id="pricing" className="py-20 bg-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            เลือกแผนการลงทุนของคุณ
          </h2>
          <p className="text-gray-400">เริ่มต้นได้ง่ายๆ ตามขนาดพอร์ตของคุณ</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Starter */}
          <div className="bg-brand-card p-8 rounded-2xl border border-gray-700 flex flex-col hover:border-brand-500/50 transition-colors">
            <h3 className="text-xl font-semibold text-gray-300">Starter</h3>
            <div className="my-4">
              <span className="text-4xl font-bold text-white">ฟรี</span>
              <span className="text-gray-500">/ เดือนแรก</span>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              สำหรับผู้เริ่มต้นที่ต้องการทดลองระบบ
            </p>
            <ul className="space-y-4 mb-8 flex-1 text-gray-300 text-sm">
              <li className="flex gap-2">
                <Check className="w-5 h-5 text-brand-500" /> บอทเทรด SET50
              </li>
              <li className="flex gap-2">
                <Check className="w-5 h-5 text-brand-500" /> สัญญาณ Delay 15 นาที
              </li>
              <li className="flex gap-2">
                <Check className="w-5 h-5 text-brand-500" /> แจ้งเตือนผ่าน LINE
              </li>
            </ul>
            <button
              onClick={onOpenAuth}
              className="w-full py-3 rounded-lg border border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white transition-colors font-semibold"
            >
              ทดลองใช้
            </button>
          </div>

          {/* Pro (Popular) */}
          <div className="bg-brand-card p-8 rounded-2xl border-2 border-brand-500 flex flex-col relative transform md:-translate-y-4 shadow-2xl shadow-brand-500/20">
            <div className="absolute top-0 right-0 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
              POPULAR
            </div>
            <h3 className="text-xl font-semibold text-brand-500">Professional</h3>
            <div className="my-4">
              <span className="text-4xl font-bold text-white">฿1,590</span>
              <span className="text-gray-500">/ เดือน</span>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              สำหรับนักลงทุนที่ต้องการกำไรจริงจัง
            </p>
            <ul className="space-y-4 mb-8 flex-1 text-gray-300 text-sm">
              <li className="flex gap-2">
                <Check className="w-5 h-5 text-brand-500" />{" "}
                <strong>บอทเทรด TFEX + SET50</strong>
              </li>
              <li className="flex gap-2">
                <Check className="w-5 h-5 text-brand-500" />{" "}
                <strong>สัญญาณ Real-time</strong>
              </li>
              <li className="flex gap-2">
                <Check className="w-5 h-5 text-brand-500" /> ระบบ Auto-Trade
                เชื่อมพอร์ต
              </li>
              <li className="flex gap-2">
                <Check className="w-5 h-5 text-brand-500" /> Support ตลอด 24 ชม.
              </li>
            </ul>
            <button
              onClick={onOpenAuth}
              className="w-full py-3 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors font-bold shadow-lg"
            >
              เลือกแพ็กเกจนี้
            </button>
          </div>

          {/* Elite */}
          <div className="bg-brand-card p-8 rounded-2xl border border-gray-700 flex flex-col hover:border-brand-gold/50 transition-colors">
            <h3 className="text-xl font-semibold text-brand-gold">Elite Fund</h3>
            <div className="my-4">
              <span className="text-4xl font-bold text-white">
                Profit Sharing
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              สำหรับพอร์ตขนาดใหญ่ (10MB+)
            </p>
            <ul className="space-y-4 mb-8 flex-1 text-gray-300 text-sm">
              <li className="flex gap-2">
                <Check className="w-5 h-5 text-brand-gold" /> กลยุทธ์ Private Fund
              </li>
              <li className="flex gap-2">
                <Check className="w-5 h-5 text-brand-gold" /> ผู้ดูแลส่วนตัว
              </li>
              <li className="flex gap-2">
                <Check className="w-5 h-5 text-brand-gold" /> API ความเร็วสูงพิเศษ
              </li>
            </ul>
            <button className="w-full py-3 rounded-lg border border-gray-600 text-white hover:border-white transition-colors font-semibold">
              ติดต่อเรา
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
