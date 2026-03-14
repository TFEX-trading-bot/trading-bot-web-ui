"use client";

import { useState, useEffect, useCallback } from "react";

// /Users/tung/Desktop/CE Project/trading-bot-web-ui/src/components/Ticker.tsx

// กำหนดโครงสร้างข้อมูลสำหรับ Ticker แต่ละตัว
interface TickerSymbol {
  name: string;
  price: string;
  change: string;
  color: string;
  volume: string;
  changePercent: string;
}

// โครงสร้างข้อมูลที่คาดว่าจะได้รับจาก API
interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  volume?: number;
  changePercent: string;
}

export default function Ticker() {
  const [tickerItems, setTickerItems] = useState<TickerSymbol[]>([]);
  const [loading, setLoading] = useState(true);

  // รายการหุ้นที่ต้องการดึงข้อมูล (อาจต้องใช้ Suffix .BK สำหรับหุ้นไทย)
  // หมายเหตุ: สัญลักษณ์สำหรับ Index และ Futures อาจแตกต่างกันไปในแต่ละ API Provider
  const symbolsToFetch = [
    "^SET50", "PTT.BK", "AOT.BK", "KBANK.BK", "ADVANC.BK", "DELTA.BK", 
    "CPALL.BK", "SCC.BK", "SCB.BK", "GULF.BK", "BDMS.BK", 
    "BBL.BK", "PTTEP.BK", "TRUE.BK", "INTUCH.BK", "MINT.BK"
  ];

  const fetchTickerData = useCallback(async () => {
    // อ่าน API Key จาก Environment Variable สำหรับ Alpha Vantage
    const apiKey = process.env.NEXT_PUBLIC_ALPHAVANTAGE_API_KEY || "YOUR_API_KEY_HERE";

    if (apiKey === "YOUR_API_KEY_HERE") {
      console.warn("Alpha Vantage API key is not configured.");
      setLoading(false);
      return;
    }

    try {
      // ขอข้อมูลหุ้นทีละตัวด้วย Promise.all เพื่อให้ดึงข้อมูลขนานกันได้รวดเร็ว
      const fetchPromises = symbolsToFetch.map(async (symbol) => {
        try {
          const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
          const response = await fetch(url);
          if (!response.ok) return null;
          
          const data = await response.json();
          
          // Alpha Vantage จะส่งกลับข้อมูลในรูปแบบ Object ที่มี Key "Global Quote"
          const quote = data["Global Quote"];
          
          if (quote && quote["05. price"]) {
            return {
              symbol: quote["01. symbol"],
              price: parseFloat(quote["05. price"]),
              change: parseFloat(quote["09. change"]),
              volume: parseFloat(quote["06. volume"]),
              changePercent: quote["10. change percent"]
            } as StockQuote;
          }
          return null;
        } catch (err) {
          console.error(`Error fetching ${symbol}:`, err);
          return null;
        }
      });

      const results = await Promise.all(fetchPromises);
      
      // กรองเอาเฉพาะข้อมูลหุ้นที่ดึงสำเร็จ (ไม่เป็น null)
      const validData = results.filter((item): item is StockQuote => item !== null);

      const formattedSymbols = validData.map((quote: StockQuote) => {
        // 2. แปลงค่าให้เป็น Number ป้องกันกรณีเป็น null/undefined แล้วเรียกใช้ .toFixed() จะทำให้เกิด Error พังทั้งหน้า
        const price = Number(quote.price) || 0;
        const change = Number(quote.change) || 0;
        const isPositive = change >= 0;
        const rawPercent = parseFloat(quote.changePercent) || 0;

        return {
          name: (quote.symbol || "UNKNOWN").replace(".BK", "").replace("^", ""), 
          price: price.toFixed(2),
          change: `${isPositive ? '+' : ''}${change.toFixed(2)}`,
          color: isPositive ? "text-green-500" : "text-red-500",
          volume: quote.volume ? Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 2 }).format(quote.volume) : "",
          changePercent: `${isPositive ? '+' : ''}${rawPercent.toFixed(2)}%`,
        };
      });

      // ทำข้อมูลซ้ำ 3 ชุดเพื่อให้ Animation วนลูปได้อย่างต่อเนื่อง
      setTickerItems([...formattedSymbols, ...formattedSymbols, ...formattedSymbols]);

    } catch (error) {
      console.error("Error fetching ticker data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickerData();
    // ตั้งเวลาให้ดึงข้อมูลใหม่ทุกๆ 1 ชั่วโมง
    const interval = setInterval(fetchTickerData, 1 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchTickerData]);

  // แสดงสถานะ Loading ขณะรอข้อมูล
  if (loading && tickerItems.length === 0) {
    return (
      <div className="bg-brand-card border-y border-gray-700 py-3 text-center text-gray-400 font-mono">
        Loading Market Data...
      </div>
    );
  }

  return (
    <div className="bg-brand-card border-y border-gray-700 py-3 overflow-hidden whitespace-nowrap relative">
      <div className="inline-block animate-marquee">
        {tickerItems.length > 0 && tickerItems.map((sym, index) => (
          <span key={index} className="mx-6 font-mono">
            <span className="text-white font-bold">{sym.name}</span>
            <span className="text-gray-400 mx-2">{sym.price}</span>
            <span className={sym.color}>
              {sym.color === "text-green-500" ? "▲" : "▼"} {sym.change} ({sym.changePercent})
            </span>
            {sym.volume && (
              <span className="text-gray-500 ml-2 text-[10px] uppercase tracking-widest">Vol: {sym.volume}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
