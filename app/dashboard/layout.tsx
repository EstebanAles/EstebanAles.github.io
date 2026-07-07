import type React from "react"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { Toaster } from "@/components/ui/sonner"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const user = {
    name: session.user.name,
    email: session.user.email,
  }

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} />
        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  )
}
