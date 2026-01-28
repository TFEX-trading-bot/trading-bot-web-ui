// /Users/tung/Desktop/CE Project/trading-bot-web-ui/src/components/Footer.tsx
import { Bot, Mail, Phone, MapPin, AlertTriangle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-brand-500 p-1.5 rounded-md shadow-[0_0_10px_#A545F2]">
                <Bot className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white">
                TradingBotSystem
              </span>
            </div>
            <p className="text-gray-400 text-sm max-w-sm">
              แพลตฟอร์มบอทเทรดอัจฉริยะ มุ่งมั่นที่จะยกระดับการลงทุนของคนไทยด้วยเทคโนโลยี
              AI ที่ทันสมัยและปลอดภัย
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">เมนู</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-brand-500">
                  หน้าแรก
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-500">
                  เกี่ยวกับเรา
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-500">
                  คู่มือการใช้งาน
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-500">
                  เงื่อนไขการให้บริการ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">ติดต่อเรา</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex gap-2">
                <Mail className="w-4 h-4 text-brand-500" />{" "}
                support@tradingbot.com
              </li>
              <li className="flex gap-2">
                <Phone className="w-4 h-4 text-brand-500" /> 02-xxx-xxxx
              </li>
              <li className="flex gap-2">
                <MapPin className="w-4 h-4 text-brand-500" /> Bangkok, Thailand
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8 text-center md:text-left">
          <div className="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg mb-6">
            <h5 className="text-yellow-500 font-bold text-sm mb-1 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" /> คำเตือนความเสี่ยง
            </h5>
            <p className="text-xs text-yellow-200/70">
              การลงทุนในหลักทรัพย์และสัญญาซื้อขายล่วงหน้า (TFEX) มีความเสี่ยง
              ผู้ลงทุนควรศึกษาข้อมูลและทำความเข้าใจลักษณะสินค้า เงื่อนไขผลตอบแทน
              และความเสี่ยงก่อนตัดสินใจลงทุน ผลการดำเนินงานในอดีต
              มิได้เป็นสิ่งยืนยันถึงผลการดำเนินงานในอนาคต
            </p>
          </div>
          <p className="text-gray-600 text-sm">
            &copy; 2024 Trading Bot System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
