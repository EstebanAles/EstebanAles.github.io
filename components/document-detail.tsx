"use client"

import {
  FileText,
  ShieldCheck,
  ShieldAlert,
  Download,
  Plus,
  FilePlus2,
  RefreshCw,
  LinkIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { UploadDialog } from "@/components/upload-dialog"
import { formatBytes, formatDateTime, shortHash } from "@/lib/format"

interface LedgerEntry {
  id: number
  action: string
  version: number
  actorName: string
  actorEmail: string
  fileName: string | null
  fileUrl: string | null
  fileSize: number | null
  fileType: string | null
  contentHash: string
  previousHash: string
  blockHash: string
  note: string | null
  createdAt: Date
}

interface DocumentInfo {
  id: number
  title: string
  category: string
  description: string | null
  currentVersion: number
  currentHash: string
  createdAt: Date
  updatedAt: Date
}

export function DocumentDetail({
  document,
  entries,
  chain,
}: {
  document: DocumentInfo
  entries: LedgerEntry[]
  chain: { valid: boolean; brokenAt: number }
}) {
  // Newest first for display.
  const timeline = [...entries].reverse()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
              {document.title}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="font-normal">
                {document.category}
              </Badge>
              <span className="text-sm text-muted-foreground">Versión actual v{document.currentVersion}</span>
            </div>
            {document.description ? (
              <p className="mt-2 max-w-prose text-sm text-muted-foreground">{document.description}</p>
            ) : null}
          </div>
        </div>
        <UploadDialog
          mode="version"
          documentId={document.id}
          trigger={
            <Button>
              <Plus className="mr-1.5 h-4 w-4" />
              Nueva versión
            </Button>
          }
        />
      </div>

      {/* Chain integrity banner */}
      <Card
        className={`flex items-center gap-3 border p-4 ${
          chain.valid
            ? "border-emerald-500/30 bg-emerald-500/5"
            : "border-destructive/40 bg-destructive/5"
        }`}
      >
        {chain.valid ? (
          <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
        ) : (
          <ShieldAlert className="h-5 w-5 shrink-0 text-destructive" />
        )}
        <div>
          <p className="text-sm font-medium text-foreground">
            {chain.valid ? "Cadena de integridad verificada" : "Cadena comprometida"}
          </p>
          <p className="text-xs text-muted-foreground">
            {chain.valid
              ? `Los ${entries.length} bloques están correctamente encadenados con SHA-256.`
              : `Se detectó una alteración a partir del bloque #${chain.brokenAt + 1}.`}
          </p>
        </div>
      </Card>

      {/* Ledger timeline */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Historial de trazabilidad ({entries.length})
        </h2>
        <ol className="relative space-y-4 border-l border-border pl-6">
          {timeline.map((e) => (
            <li key={e.id} className="relative">
              <span
                className={`absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background ${
                  e.action === "CREATE" ? "bg-primary" : "bg-accent-foreground"
                }`}
              >
                {e.action === "CREATE" ? (
                  <FilePlus2 className="h-3.5 w-3.5 text-primary-foreground" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5 text-primary-foreground" />
                )}
              </span>
              <Card className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={e.action === "CREATE" ? "default" : "secondary"}>
                      {e.action === "CREATE" ? "Creado" : "Actualizado"}
                    </Badge>
                    <span className="text-sm font-medium text-foreground">v{e.version}</span>
                  </div>
                  <time className="text-xs text-muted-foreground">{formatDateTime(e.createdAt)}</time>
                </div>

                <p className="mt-2 text-sm text-foreground">
                  <span className="font-medium">{e.actorName}</span>{" "}
                  <span className="text-muted-foreground">({e.actorEmail})</span>
                </p>
                {e.note ? <p className="mt-1 text-sm text-muted-foreground">“{e.note}”</p> : null}

                {e.fileName ? (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-md border border-border bg-secondary/50 p-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm text-foreground">{e.fileName}</span>
                      {e.fileSize ? (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatBytes(e.fileSize)}
                        </span>
                      ) : null}
                    </div>
                    {e.fileUrl ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 shrink-0"
                        render={<a href={e.fileUrl} target="_blank" rel="noreferrer" download />}
                      >
                        <Download className="mr-1 h-3.5 w-3.5" />
                        Descargar
                      </Button>
                    ) : null}
                  </div>
                ) : null}

                <Separator className="my-3" />

                <dl className="grid gap-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <dt className="w-24 shrink-0 text-muted-foreground">Contenido</dt>
                    <dd className="font-mono text-foreground">{shortHash(e.contentHash)}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="w-24 shrink-0 text-muted-foreground">Hash previo</dt>
                    <dd className="flex items-center gap-1 font-mono text-muted-foreground">
                      <LinkIcon className="h-3 w-3" />
                      {shortHash(e.previousHash)}
                    </dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="w-24 shrink-0 text-muted-foreground">Hash bloque</dt>
                    <dd className="font-mono font-medium text-primary">{shortHash(e.blockHash)}</dd>
                  </div>
                </dl>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
