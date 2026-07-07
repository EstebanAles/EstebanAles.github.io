import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { SettingsView } from "@/components/settings-view"

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">Configuración</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Preferencias de la cuenta y de la cadena de trazabilidad.
      </p>
      <div className="mt-6">
        <SettingsView name={session.user.name} email={session.user.email} />
      </div>
    </div>
  )
}
