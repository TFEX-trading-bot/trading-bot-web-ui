// /Users/tung/Desktop/CE Project/trading-bot-web-ui/src/components/Ticker.tsx
export default function Ticker() {
  const symbols = [
    { name: "SET50", price: "920.45", change: "+5.20", color: "text-green-500" },
    { name: "S50M24", price: "918.20", change: "+4.80", color: "text-green-500" },
    { name: "GOLF", price: "40.25", change: "-0.50", color: "text-red-500" },
    { name: "DELTA", price: "72.00", change: "+1.25", color: "text-green-500" },
    { name: "PTT", price: "34.50", change: "+0.25", color: "text-green-500" },
    { name: "AOT", price: "65.00", change: "-0.25", color: "text-red-500" },
    { name: "KBANK", price: "125.00", change: "+1.00", color: "text-green-500" },
    { name: "ADVANC", price: "205.00", change: "+2.00", color: "text-green-500" },
  ];

  // Duplicate list for seamless loop
  const tickerItems = [...symbols, ...symbols, ...symbols];

  return (
    <div className="bg-brand-card border-y border-gray-700 py-3 overflow-hidden whitespace-nowrap relative">
      <div className="inline-block animate-marquee">
        {tickerItems.map((sym, index) => (
          <span key={index} className="mx-6 font-mono">
            <span className="text-white font-bold">{sym.name}</span>
            <span className="text-gray-400 mx-2">{sym.price}</span>
            <span className={sym.color}>
              {sym.color === "text-green-500" ? "▲" : "▼"} {sym.change}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
