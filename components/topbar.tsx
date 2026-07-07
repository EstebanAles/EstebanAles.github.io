"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  User,
  Settings,
  ShieldCheck,
  Menu,
  LogOut,
} from "lucide-react"

const items = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/dashboard/documents", label: "Documentos", icon: FileText },
  { href: "/dashboard/profile", label: "Perfil", icon: User },
  { href: "/dashboard/settings", label: "Configuración", icon: Settings },
]

export function Topbar({ user }: { user: { name: string; email: string } }) {
  const router = useRouter()
  const pathname = usePathname()

  async function signOut() {
    await authClient.signOut()
    router.push("/sign-in")
    router.refresh()
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-8">
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger
            render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menú" />}
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-sidebar p-0 text-sidebar-foreground">
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
              <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <ShieldCheck className="size-5" />
              </div>
              <span className="text-lg font-semibold">ChainDocs</span>
            </div>
            <nav className="flex flex-col gap-1 p-4">
              {items.map((item) => {
                const active =
                  item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href)
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
          </SheetContent>
        </Sheet>
        <h1 className="text-base font-semibold text-foreground md:hidden">ChainDocs</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" className="flex items-center gap-2 px-2" />}>
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium sm:inline">{user.name}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex flex-col">
            <span>{user.name}</span>
            <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/dashboard/profile" />}>
            <User className="size-4" />
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
            <Settings className="size-4" />
            Configuración
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
            <LogOut className="size-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
