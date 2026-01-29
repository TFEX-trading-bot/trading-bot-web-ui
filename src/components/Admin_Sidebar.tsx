'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, type ReactNode } from 'react'
import Image from 'next/image'
import { UserRound, Briefcase, BadgeDollarSign } from 'lucide-react'

// ========== utils ==========
function classNames(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(' ')
}

// ========== types ==========
type Item = { key: string; label: string; icon: ReactNode; href: string }

// ========== NavPill ==========
export function NavPill({
  icon,
  label,
  href,
  active = false,
}: {
  icon: ReactNode
  label: string
  href: string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={classNames(
        'group flex items-center justify-between rounded-[12px] px-4 py-3 outline-none',
        'bg-[linear-gradient(90deg,var(--tw-gradient-stops))] from-[#8934C8] to-[#A86ADA]',
        'shadow-[inset_0_1px_0_rgba(255,255,255,.12),_0_10px_24px_rgba(0,0,0,.25)]',
        'text-white transition hover:brightness-105 active:scale-[.99]',
        active && 'ring-2 ring-white/30'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl
                     bg-[linear-gradient(135deg,#A86ADA,#C79EF3)]
                     ring-1 ring-white/25 shadow-md"
        >
          <span className="text-white">{icon}</span>
        </span>

        {/* Text (ให้เท่ากับ client sidebar) */}
        <span className="text-base font-semibold tracking-tight drop-shadow-sm">
          {label}
        </span>
      </div>
    </Link>
  )
}

// ========== Admin Sidebar ==========
export default function Admin_Sidebar({ title = 'Name Web' }: { title?: string }) {
  const pathname = usePathname()

  const items: Item[] = useMemo(
    () => [
      { key: 'client', label: 'Client', href: '/client', icon: <UserRound className="h-5 w-5" /> },
      { key: 'all-bots', label: 'All Bots', href: '/all-bots', icon: <Briefcase className="h-5 w-5" /> },
      { key: 'subscription', label: 'Subscription', href: '/subscription', icon: <BadgeDollarSign className="h-5 w-5" /> },
    ],
    []
  )

  const isActive = (href: string) => pathname?.startsWith(href) ?? false

  return (
    <aside
      className="min-h-screen w-[260px] min-w-[300px] shrink-0
                 bg-[linear-gradient(135deg,var(--tw-gradient-stops))] from-[#5E1593] via-[#6E11B0] to-[#55239E]
                 p-4 text-white"
    >
      {/* Brand */}
      <div className="mb-8 select-none px-2 flex items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl"
        >
          <Image
            src="/icons/tradingbot.png"
            alt="Trading Bot Logo"
            width={64}
            height={64}
            className="object-contain"
          />
        </div>

        <div className="leading-tight">
          <div className="text-[20px] font-semibold text-white drop-shadow-sm">
            Trading Bot
          </div>
          <div className="text-[20px] font-semibold text-white drop-shadow-sm -mt-1">
            System
          </div>
        </div>
      </div>

      {/* List */}
      <nav className="space-y-3">
        {items.map((it) =>
          isActive(it.href) ? (
            <NavPill key={it.key} icon={it.icon} label={it.label} href={it.href} active />
          ) : (
            <Link
              key={it.key}
              href={it.href}
              className="group flex w-full items-center justify-between rounded-2xl px-3 py-2.5 hover:bg-white/5"
            >
              <div className="flex items-center gap-3">
                {/* Icon */}
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl
                               bg-[linear-gradient(135deg,#A86ADA,#C79EF3)]
                               ring-1 ring-white/20 shadow-md"
                >
                  <span className="text-white">{it.icon}</span>
                </span>

                {/* Text (ใช้ text-base เท่ากับ client) */}
                <span className="text-base font-semibold tracking-tight text-white/95">
                  {it.label}
                </span>
              </div>
            </Link>
          )
        )}
      </nav>
    </aside>
  )
}
