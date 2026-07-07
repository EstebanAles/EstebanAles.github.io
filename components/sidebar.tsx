"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText, ShieldCheck, User, Settings } from "lucide-react"

const items = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/dashboard/documents", label: "Documentos", icon: FileText },
  { href: "/dashboard/profile", label: "Perfil", icon: User },
  { href: "/dashboard/settings", label: "Configuración", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <ShieldCheck className="size-5" />
        </div>
        <span className="text-lg font-semibold tracking-tight">ChainDocs</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {items.map((item) => {
          const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent px-3 py-2 text-xs text-sidebar-accent-foreground">
          <ShieldCheck className="size-4 shrink-0" />
          <span className="text-pretty">Trazabilidad garantizada por cadena de hashes SHA-256</span>
        </div>
      </div>
    </aside>
  )
}
