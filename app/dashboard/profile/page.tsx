import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getStats } from "@/app/actions/documents"
import { ProfileForm } from "@/components/profile-form"
import { Card } from "@/components/ui/card"
import { FileText, Activity, FolderTree } from "lucide-react"

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const stats = await getStats()

  const items = [
    { label: "Documentos", value: stats.documents, icon: FileText },
    { label: "Eventos registrados", value: stats.events, icon: Activity },
    { label: "Categorías", value: stats.categories, icon: FolderTree },
  ]

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">Perfil</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Administra tu información personal y revisa tu actividad.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {items.map((it) => (
          <Card key={it.label} className="p-4">
            <it.icon className="h-4 w-4 text-muted-foreground" />
            <p className="mt-2 text-2xl font-semibold text-foreground">{it.value}</p>
            <p className="text-xs text-muted-foreground">{it.label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <ProfileForm
          name={session.user.name}
          email={session.user.email}
        />
      </div>
    </div>
  )
}
