"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createDocument, addDocumentVersion } from "@/app/actions/documents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, Loader2, FileUp } from "lucide-react"
import { toast } from "sonner"

interface UploadDialogProps {
  mode?: "create" | "version"
  documentId?: number
  documentTitle?: string
  trigger?: React.ReactNode
}

export function UploadDialog({ mode = "create", documentId, documentTitle, trigger }: UploadDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      if (mode === "create") {
        await createDocument(formData)
        toast.success("Documento registrado en la cadena de bloques")
      } else {
        formData.set("documentId", String(documentId))
        const res = await addDocumentVersion(formData)
        toast.success(`Nueva versión v${res.version} añadida a la cadena`)
      }
      formRef.current?.reset()
      setFileName(null)
      setOpen(false)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al subir el documento")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ? (
            (trigger as React.ReactElement)
          ) : (
            <Button>
              <Upload className="size-4" />
              Subir documento
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Subir nuevo documento" : `Nueva versión`}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "El archivo se firma con un hash SHA-256 y se registra como el bloque génesis de su historial."
              : `Añade una versión de "${documentTitle}". Se encadena al último bloque registrado.`}
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "create" && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Título del documento</Label>
                <Input id="title" name="title" placeholder="Contrato de servicios 2026" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="category">Categoría</Label>
                <Input id="category" name="category" placeholder="Contratos" defaultValue="General" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea id="description" name="description" placeholder="Breve descripción del documento" rows={2} />
              </div>
            </>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="note">Nota de esta versión (opcional)</Label>
            <Input id="note" name="note" placeholder="Ej. Revisión legal aprobada" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="file">Archivo</Label>
            <label
              htmlFor="file"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-6 text-center transition-colors hover:bg-muted"
            >
              <FileUp className="size-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {fileName ?? "Haz clic para seleccionar un archivo"}
              </span>
            </label>
            <Input
              id="file"
              name="file"
              type="file"
              required
              className="sr-only"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="size-4 animate-spin" />}
            {mode === "create" ? "Registrar documento" : "Añadir versión"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
