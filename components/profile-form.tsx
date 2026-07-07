"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateProfile } from "@/app/actions/profile"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const router = useRouter()
  const [value, setValue] = useState(name)
  const [saving, setSaving] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      fd.set("name", value)
      await updateProfile(fd)
      toast.success("Perfil actualizado")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="bg-primary text-lg text-primary-foreground">
            {initials(value || email)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-foreground">{value || "Sin nombre"}</p>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre completo</Label>
          <Input
            id="name"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Tu nombre"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input id="email" value={email} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground">El correo no se puede modificar.</p>
        </div>
        <Button type="submit" disabled={saving || value.trim() === name}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </form>
    </Card>
  )
}
