// components/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useState, useEffect, type ReactNode, type MouseEvent } from 'react'
import Image from 'next/image'
import { Briefcase, Store, BadgeDollarSign, ChevronDown, BarChart3 } from 'lucide-react'

// --- Types
export type NavItem = {
  label: string
  href: string // บังคับให้มี href เพื่อการนำทาง
  icon?: ReactNode
  children?: { label: string; href: string }[]
}

// --- Helpers
function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ')
}

// --- Component
export default function Client_Sidebar({
  items,
}: {
  items?: NavItem[]
}) {
  const pathname = usePathname() // ใช้ Pathname เพื่อดูว่าอยู่หน้าไหน
  const [open, setOpen] = useState<Record<string, boolean>>({})

  // default menu
  const menu: NavItem[] = useMemo(
    () =>
      items ?? [
        {
          label: 'My Bot',
          icon: <Briefcase className="h-5 w-5" aria-hidden />,
          href: '/my-bot',
          children: [
            { label: 'PTT 1', href: '/my-bot/ptt-1' },
            { label: 'PTT 2', href: '/my-bot/ptt-2' },
            { label: 'PTT 3', href: '/my-bot/ptt-3' },
          ],
        },
        {
          label: 'Market Place',
          icon: <Store className="h-5 w-5" aria-hidden />,
          href: '/marketplace',
        },
        {
          label: 'Pricing',
          icon: <BadgeDollarSign className="h-5 w-5" aria-hidden />,
          href: '/pricing',
        },
      ],
    [items]
  )

  // Auto-open menu: ถ้า URL ปัจจุบันตรงกับลูกหลาน ให้เปิดเมนูแม่โดยอัตโนมัติ
  useEffect(() => {
    if (!pathname) return
    menu.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((child) => pathname.startsWith(child.href))
        if (isChildActive) {
          setOpen((prev) => ({ ...prev, [item.label]: true }))
        }
      }
    })
  }, [pathname, menu])

  return (
    <aside className="min-h-screen w-[260px] min-w-[300px] shrink-0 bg-[linear-gradient(135deg,var(--tw-gradient-stops))] from-[#5E1593] via-[#6E11B0] to-[#55239E] p-4 text-white">
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

      {/* Nav */}
      <nav className="space-y-3">
        {menu.map((item) => {
          const key = item.label
          const hasChildren = !!item.children?.length
          
          // ตรวจสอบว่า Menu หลักนี้ Active อยู่หรือไม่ (โดยดูจาก URL)
          // Active เมื่อ: URL ตรงกันเป๊ะ หรือ URL เป็นลูกของ path นี้ (กรณีไม่มี children แยก) หรือ children ตัวใดตัวหนึ่ง active
          const isActive = pathname === item.href || (item.children ? item.children.some(c => pathname.startsWith(c.href)) : pathname.startsWith(item.href))
          
          const opened = open[key] || false

          return (
            <div key={key}>
              {isActive ? (
                // กรณี Active: ใช้ NavPill เต็มรูปแบบ
                <NavPill
                  icon={item.icon as ReactNode}
                  label={item.label}
                  href={item.href} // ใส่ Link จริง
                  active={true}
                  // เอา preventDefaultOnClick ออกเพื่อให้ Link ทำงาน
                  rightIcon={
                    hasChildren ? (
                      <ChevronDown
                        className={classNames(
                          'h-4 w-4 transition-transform',
                          opened && 'rotate-180'
                        )}
                      />
                    ) : undefined
                  }
                  onRightIconClick={() => {
                    if (hasChildren) {
                      setOpen((s) => ({ ...s, [key]: !s[key] }))
                    }
                  }}
                />
              ) : (
                // กรณี Inactive: ใช้ Link ปกติ (เปลี่ยนจาก button เป็น Link)
                <Link
                  href={item.href}
                  className="group flex w-full items-center justify-between rounded-2xl px-3 py-2 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#A86ADA,#C79EF3)] ring-1 ring-white/20 shadow-md">
                      <span className="text-white">{item.icon}</span>
                    </span>
                    <span className="text-base font-semibold tracking-tight text-white/95">
                      {item.label}
                    </span>
                  </div>
                  {hasChildren && (
                    <div
                        onClick={(e) => {
                            e.preventDefault(); // กันไม่ให้ Link ทำงานเมื่อกดปุ่มลูกศร
                            setOpen((s) => ({ ...s, [key]: !s[key] }))
                        }}
                        className="ml-3 inline-flex items-center justify-center rounded-md p-1.5 ring-1 ring-white/10 opacity-0 transition group-hover:opacity-100 hover:bg-white/10 cursor-pointer"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  )}
                </Link>
              )}

              {/* Submenu */}
              {hasChildren && opened && (
                <div className="mt-2 space-y-2 pl-4">
                  {item.children!.map((c) => {
                    const isChildActive = pathname === c.href
                    
                    if (isChildActive) {
                      return (
                        <MiniNavPill
                          key={c.href}
                          icon={<BarChart3 className="h-4 w-4 text-white" />}
                          label={c.label}
                          href={c.href}
                          active
                        />
                      )
                    }

                    // แถวปกติใน popup: เปลี่ยนเป็น Link
                    return (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="group flex w-full items-center justify-between rounded-[16px] px-3 py-2 hover:bg-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl
                                             bg-[linear-gradient(135deg,#A86ADA,#C79EF3)]
                                             ring-1 ring-white/20 shadow-md">
                            <BarChart3 className="h-4 w-4 text-white" />
                          </span>
                          <span className="text-sm font-semibold text-white/95">{c.label}</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto" />
    </aside>
  )
}

// =========================
// Gradient Nav Button (NavPill) - แก้ไขให้รองรับ Link
// =========================
export function NavPill({
  icon,
  label,
  rightIcon,
  href,
  active = false,
  onClick,
  onRightIconClick,
}: {
  icon: ReactNode
  label: string
  rightIcon?: ReactNode
  href?: string
  active?: boolean
  onClick?: () => void
  onRightIconClick?: (e: MouseEvent) => void
}) {
  const [pressed, setPressed] = useState(false)
  // บังคับใช้ Link ถ้ามี href
  const Comp: any = href ? Link : 'div'
  
  return (
    <Comp
      href={href || '#'}
      onClick={(e: any) => {
        // ลบ e.preventDefault() ออก เพื่อให้ Link ทำงาน
        onClick?.()
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      data-pressed={pressed ? 'true' : 'false'}
      className={classNames(
        'group flex items-center justify-between rounded-[12px] px-5 py-4 outline-none',
        'bg-[linear-gradient(90deg,var(--tw-gradient-stops))] from-[#8934C8] to-[#A86ADA]',
        'shadow-[inset_0_1px_0_rgba(255,255,255,.12),_0_10px_24px_rgba(0,0,0,.25)]',
        'text-white transition hover:brightness-105 active:scale-[.99] data-[pressed=true]:ring-2 data-[pressed=true]:ring-white/40',
        active && 'ring-2 ring-white/30'
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl
          bg-[linear-gradient(135deg,#A86ADA,#C79EF3)]
          ring-1 ring-white/25
          shadow-[inset_0_1px_0_rgba(255,255,255,.35),_0_8px_18px_rgba(0,0,0,.28)]">
          <span className="text-white">{icon}</span>
        </span>
        <span className="text-base font-semibold tracking-tight drop-shadow-sm">{label}</span>
      </div>

      {rightIcon && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault() // กันไม่ให้ Link ทำงานเมื่อกดปุ่มขวา
            e.stopPropagation()
            onRightIconClick?.(e)
          }}
          className={classNames(
            'ml-3 inline-flex items-center justify-center rounded-md p-1.5 ring-1 ring-white/10 transition',
            active ? 'bg-white/10 opacity-100' : 'bg-transparent opacity-0 group-hover:opacity-100'
          )}
        >
          {rightIcon}
        </button>
      )}
    </Comp>
  )
}

// =========================
// Mini Gradient Nav Pill - แก้ไขให้รองรับ Link
// =========================
function MiniNavPill({
  icon,
  label,
  href,
  active = false,
  onClick,
}: {
  icon: ReactNode
  label: string
  href?: string
  active?: boolean
  onClick?: () => void
}) {
  const [pressed, setPressed] = useState(false)
  const Comp: any = href ? Link : 'div'
  
  return (
    <Comp
      href={href || '#'}
      onClick={(e: any) => {
        // ลบ e.preventDefault() ออก
        onClick?.()
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      data-pressed={pressed ? 'true' : 'false'}
      className={classNames(
        'group flex items-center justify-between rounded-[12px] px-4 py-2.5 outline-none',
        'bg-[linear-gradient(90deg,var(--tw-gradient-stops))] from-[#8934C8] to-[#A86ADA]',
        'shadow-[inset_0_1px_0_rgba(255,255,255,.12),_0_6px_14px_rgba(0,0,0,.22)]',
        'text-white transition hover:brightness-105 active:scale-[.99]',
        active && 'ring-2 ring-white/25'
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl
          bg-[linear-gradient(135deg,#A86ADA,#C79EF3)]
          ring-1 ring-white/25 shadow-md">
          <span className="text-white">{icon}</span>
        </span>
        <span className="text-sm font-semibold tracking-tight drop-shadow-sm">{label}</span>
      </div>
    </Comp>
  )
}