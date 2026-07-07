"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, ShieldCheck, Fingerprint, Link2, GitBranch } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function SettingsView({ name, email }: { name: string; email: string }) {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  async function signOut() {
    setSigningOut(true)
    await authClient.signOut()
    router.push("/sign-in")
    router.refresh()
  }

  const features = [
    {
      icon: Fingerprint,
      title: "Hash de contenido (SHA-256)",
      desc: "Cada archivo genera una huella única. Detecta duplicados y cualquier alteración del contenido.",
    },
    {
      icon: Link2,
      title: "Encadenamiento de bloques",
      desc: "Cada versión referencia el hash de la anterior, formando una cadena inmutable y verificable.",
    },
    {
      icon: GitBranch,
      title: "Trazabilidad de autoría",
      desc: "Se registra quién creó o actualizó cada documento, con fecha y hora exactas.",
    },
    {
      icon: ShieldCheck,
      title: "Verificación de integridad",
      desc: "La cadena se recalcula en cada consulta; si un bloque fue manipulado, se marca de inmediato.",
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-sm font-semibold text-foreground">Cuenta</h2>
        <Separator className="my-4" />
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Nombre</dt>
            <dd className="font-medium text-foreground">{name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Correo</dt>
            <dd className="font-medium text-foreground">{email}</dd>
          </div>
        </dl>
      </Card>

      <Card className="p-6">
        <h2 className="text-sm font-semibold text-foreground">Cómo funciona la trazabilidad blockchain</h2>
        <Separator className="my-4" />
        <ul className="space-y-4">
          {features.map((f) => (
            <li key={f.title} className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary">
                <f.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{f.title}</p>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="border-destructive/30 p-6">
        <h2 className="text-sm font-semibold text-foreground">Sesión</h2>
        <Separator className="my-4" />
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">Cierra tu sesión en este dispositivo.</p>
          <Button variant="destructive" onClick={signOut} disabled={signingOut}>
            <LogOut className="mr-1.5 h-4 w-4" />
            {signingOut ? "Cerrando..." : "Cerrar sesión"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
