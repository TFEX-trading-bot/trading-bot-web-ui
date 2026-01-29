import { Bot, User2 } from "lucide-react"

export type BotDisplayVariant = "green" | "red" | "gray"
export type BotKind = "ai" | "manual"

export type BotDisplayProps = {
  name: string
  change?: string
  changePct?: string
  price?: number
  currency?: string
  variant?: BotDisplayVariant
  botKind?: BotKind
}

function getVariantClasses(variant: BotDisplayVariant = "green") {
  switch (variant) {
    case "green":
      return { bg: "from-[#00C853] to-[#009624]" }
    case "red":
      return { bg: "from-[#FF5252] to-[#D32F2F]" }
    case "gray":
    default:
      return { bg: "from-[#78909C] to-[#546E7A]" }
  }
}

function getChangeArrow(change?: string) {
  if (!change) return ""
  const trimmed = change.trim()
  if (trimmed.startsWith("-")) return "↘"
  if (trimmed.startsWith("+")) return "↗"
  return ""
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
  const { bg } = getVariantClasses(variant)
  const Arrow = getChangeArrow(change)
  const Icon = botKind === "manual" ? User2 : Bot

  const numericPrice = Number.isFinite(Number(price)) ? Number(price) : 0

  return (
    <div
      className={`
        relative flex w-full h-[210px] flex-col justify-between rounded-[28px]
        bg-[linear-gradient(135deg,var(--tw-gradient-stops))] ${bg}
        p-7 text-white shadow-lg transition-transform hover:-translate-y-1
      `}
    >
      {/* --- ส่วน Header (Icon & Name) --- */}
      <div className="flex items-start gap-4">
        {/* 1. Icon Box: ขยายขนาดให้ใหญ่ขึ้น (h-14 w-14) */}
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl
                     bg-white/20 shadow-md backdrop-blur-sm"
        >
          {/* ขยายขนาดไอคอนข้างใน (h-8 w-8) */}
          <Icon className="h-8 w-8 text-white" />
        </span>

        {/* Name & Change Info */}
        <div className="flex flex-col pt-1">
          {/* 2. ชื่อหุ้น: ขยายฟอนต์เป็น text-xl และหนาขึ้น */}
          <div className="text-xl font-extrabold tracking-wide text-white uppercase opacity-100 drop-shadow-sm">
            {name}
          </div>

          {/* 3. ส่วนกำไร: ปรับให้อ่านง่ายขึ้น */}
          {change && (
            <div className="mt-1 flex items-center text-sm font-medium text-white/90">
              {Arrow && <span className="mr-1 text-xs font-bold">{Arrow}</span>}
              <span>{change}</span> 
              {changePct && <span className="ml-1.5 opacity-80 text-xs">({changePct})</span>}
            </div>
          )}
        </div>
      </div>

      {/* --- ส่วน Price --- */}
      <div>
        <div className="flex items-baseline gap-1.5">
          {/* ปรับขนาดราคาให้ใหญ่สมส่วน */}
          <span className="text-4xl font-bold leading-none tracking-tight drop-shadow-sm">
            {numericPrice.toFixed(2)}
          </span>
          <span className="text-xs font-bold tracking-wider opacity-80 uppercase">
            {currency}
          </span>
        </div>
      </div>
    </div>
  )
}