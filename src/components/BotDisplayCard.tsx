import { Bot, User2 } from "lucide-react";

export type BotDisplayVariant = "green" | "red" | "gray";
export type BotKind = "ai" | "manual";

export type BotDisplayProps = {
  name: string;
  change?: string;
  changePct?: string;
  price?: number;
  currency?: string;
  variant?: BotDisplayVariant;
  botKind?: BotKind;
};

function getVariantClasses(variant: BotDisplayVariant = "green") {
  switch (variant) {
    case "green": return { bg: "from-[#00C853] to-[#009624]" };
    case "red": return { bg: "from-[#FF5252] to-[#D32F2F]" };
    case "gray": default: return { bg: "from-[#78909C] to-[#546E7A]" };
  }
}

export default function BotDisplayCard({
  name,
  change = "",
  changePct = "",
  price = 0,
  currency = "THB",
  variant = "green",
  botKind = "ai",
}: BotDisplayProps) {
  const { bg } = getVariantClasses(variant);
  const Icon = botKind === "manual" ? User2 : Bot;

  return (
    <div className={`relative flex w-full h-[210px] flex-col justify-between rounded-[28px] bg-[linear-gradient(135deg,var(--tw-gradient-stops))] ${bg} p-7 text-white shadow-lg transition-transform hover:-translate-y-1`}>
      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
          <Icon className="h-8 w-8 text-white" />
        </span>
        <div className="flex flex-col pt-1">
          {/* ✅ แสดงชื่อหุ้น (TTBH26 / S50H26) */}
          <div className="text-xl font-extrabold uppercase tracking-wide drop-shadow-sm">
            {name}
          </div>
          <div className="mt-1 text-sm font-medium text-white/90">
            {change} <span className="text-xs opacity-80">({changePct})</span>
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-bold tracking-tight">{price.toFixed(2)}</span>
          <span className="text-xs font-bold uppercase opacity-80">{currency}</span>
        </div>
      </div>
    </div>
  );
}