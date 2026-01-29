"use client";

import TopUserButton from "@/components/TopUserButton";
import StrategyCard from "@/components/StrategyCard";
import AddCard from "@/components/AddCard";

export default function PolicyBotPage() {
  return (
    <section className="min-h-screen w-full bg-white border-l border-black/10">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-black/5 bg-white">
        <div className="flex items-center px-8 py-4">
          <h1
              className="text-[30px] font-extrabold 
                        bg-gradient-to-r from-[#7111B6] via-[#901CFA] to-[#5837F6]
                        bg-clip-text text-transparent"
              >
                Policy Bot
            </h1>
          <div className="ml-auto">
            <TopUserButton name="Cornellia Hubbert" />
          </div>
        </div>
      </div>


      {/* Content */}
      <div className="px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <StrategyCard title="AI Strategy" onRemove={() => console.log("remove")} />
          <AddCard onClick={() => console.log("add")} />
        </div>
      </div>
    </section>
  );
}
