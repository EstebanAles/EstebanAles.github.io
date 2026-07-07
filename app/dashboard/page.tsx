import { getStats, getRecentActivity, getDocuments } from "@/app/actions/documents"
import { UploadDialog } from "@/components/upload-dialog"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { shortHash } from "@/lib/blockchain"
import { relativeTime } from "@/lib/format"
import Link from "next/link"
import { FileText, Activity, FolderTree, FilePlus2, ArrowRight, Blocks } from "lucide-react"

export default async function DashboardPage() {
  const [stats, activity, docs] = await Promise.all([getStats(), getRecentActivity(8), getDocuments()])

  const cards = [
    { label: "Documentos", value: stats.documents, icon: FileText },
    { label: "Registros en cadena", value: stats.events, icon: Blocks },
    { label: "Categorías", value: stats.categories, icon: FolderTree },
  ]

  const recentDocs = docs.slice(0, 4)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">Panel de control</h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            Gestión documental con trazabilidad inmutable mediante cadena de hashes.
          </p>
        </div>
        <UploadDialog />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <Card key={c.label} className="flex flex-row items-center gap-4 p-5">
              <div className="flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{c.value}</p>
                <p className="text-sm text-muted-foreground">{c.label}</p>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent documents */}
        <Card className="flex flex-col gap-4 p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Documentos recientes</h2>
            <Link
              href="/dashboard/documents"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Ver todos <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {recentDocs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
              <FilePlus2 className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Aún no hay documentos. Sube el primero.</p>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {recentDocs.map((doc) => (
                <li key={doc.id}>
                  <Link
                    href={`/dashboard/documents/${doc.id}`}
                    className="flex items-center gap-3 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                      <FileText className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{doc.title}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">{shortHash(doc.currentHash)}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      v{doc.currentVersion}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Activity ledger */}
        <Card className="flex flex-col gap-4 p-5 lg:col-span-3">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            <h2 className="font-semibold text-foreground">Actividad reciente (ledger)</h2>
          </div>
          {activity.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Sin actividad todavía.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {activity.map((e) => (
                <li key={e.id} className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <Blocks className="size-4 text-secondary-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{e.actorName}</span>{" "}
                      {e.action === "CREATE" ? "creó" : "actualizó"} un documento{" "}
                      <span className="text-muted-foreground">(v{e.version})</span>
                    </p>
                    <p className="truncate font-mono text-xs text-muted-foreground">block {shortHash(e.blockHash)}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{relativeTime(e.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
