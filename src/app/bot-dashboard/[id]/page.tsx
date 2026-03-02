"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar"; 
import Footer from "@/components/Footer"; 
import { Bot, TrendingUp, TrendingDown, Loader2, AlertCircle } from "lucide-react";

// --- Interface สำหรับ TypeScript ---
interface HistoryOrder {
  id: number;
  botId: number;
  orderId: string;
  priceAt: string;
  amount: number;
  action: "BUY" | "SELL";
  totalProfit: string;
  dateTime: string;
}

interface BotData {
  id: number;
  stock: string;
  status: string;
  copyRate: number;
  createdAt: string;
  totalPnL: number;
  tradeCount: number;
  history: HistoryOrder[];
}

export default function DashboardPage() {
  const params = useParams();
  const botId = params.id;
  const [data, setData] = useState<BotData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBotData = async () => {
    if (!botId) return;
    try {
      const response = await fetch(`http://localhost:3000/bots/${botId}`);
      if (!response.ok) throw new Error("ไม่พบบอท ID นี้");
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBotData();
    const timer = setInterval(fetchBotData, 30000);
    return () => clearInterval(timer);
  }, [botId]);

  const isLoss = (data?.totalPnL ?? 0) < 0;

  if (isLoading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="animate-spin text-[#6A0DAD] w-12 h-12" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-kanit bg-[#F8F9FB]">
      <Navbar onOpenAuth={() => {}} />

      <main className="flex-grow pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h2>
        </div>

        <section className="space-y-8">
          <h3 className="text-4xl font-black text-[#6A0DAD]">{data?.stock}</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* กล่อง Current Profits (เปลี่ยนสีตามกำไร/ขาดทุน) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h4 className="text-lg font-bold text-slate-800 mb-4">Current Profits</h4>
              <div className={`p-6 rounded-2xl flex items-center gap-6 border ${
                isLoss ? 'bg-rose-50 border-rose-100' : 'bg-[#ECFDF5] border-emerald-100'
              }`}>
                <div className={isLoss ? 'text-rose-500' : 'text-[#10B981]'}>
                  {isLoss ? <TrendingDown size={48} strokeWidth={2.5} /> : <TrendingUp size={48} strokeWidth={2.5} />}
                </div>
                <div>
                  <p className="text-slate-600 font-bold text-sm">Total PnL</p>
                  <p className={`text-3xl font-bold ${isLoss ? 'text-rose-600' : 'text-[#10B981]'}`}>
                    {data?.totalPnL.toLocaleString()} ฿
                  </p>
                </div>
              </div>
            </div>

            {/* กล่อง Bot Status (แสดงเวลา Order ล่าสุด + AM/PM) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h4 className="text-lg font-bold text-slate-800 mb-4">Bot Status</h4>
              <div className="bg-[#F3E8FF] p-6 rounded-2xl flex items-center gap-4 border border-purple-50">
                <div className="p-3 bg-white rounded-xl shadow-sm"><Bot size={32} className="text-[#6A0DAD]" /></div>
                <div>
                  <p className="text-xl font-bold text-slate-800 uppercase">{data?.status}</p>
                  <p className="text-slate-500 text-sm font-medium">
                    {data?.history && data.history.length > 0 
                      ? new Date(data.history[0].dateTime).toLocaleString('en-GB', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit', second: '2-digit',
                          hour12: true,
                        }).toUpperCase().replace(',', '')
                      : 'ไม่มีข้อมูลการเทรด'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ตาราง Order History (เพิ่ม AM/PM ในคอลัมน์วันที่) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h4 className="text-xl font-bold text-slate-800 mb-6">Order History</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#F8F9FB] text-slate-600 font-bold text-sm">
                    <th className="p-4 rounded-l-2xl">Price</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Date-Time</th>
                    <th className="p-4">Action</th>
                    <th className="p-4 rounded-r-2xl text-right">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data?.history.map((order: HistoryOrder) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-700">{parseFloat(order.priceAt).toFixed(2)}</td>
                      <td className="p-4 text-slate-600 font-medium">{order.amount}</td>
                      <td className="p-4 text-slate-400 text-xs font-medium">
                        {/* แก้ไขส่วนนี้: เพิ่ม AM/PM ในตาราง */}
                        {new Date(order.dateTime).toLocaleString('en-GB', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit', second: '2-digit',
                          hour12: true,
                        }).toUpperCase().replace(',', '')}
                      </td>
                      <td className="p-4">
                        <span className={`px-4 py-1 rounded-full text-[10px] font-black border ${
                          order.action === 'BUY' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' : 'border-rose-200 text-rose-500 bg-rose-50'
                        }`}>
                          {order.action}
                        </span>
                      </td>
                      <td className={`p-4 text-right font-bold ${parseFloat(order.totalProfit) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {parseFloat(order.totalProfit) >= 0 ? '+' : ''}{parseFloat(order.totalProfit).toLocaleString()} ฿
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}