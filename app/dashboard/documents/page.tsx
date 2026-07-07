import { getDocuments } from "@/app/actions/documents"
import { DocumentsTable } from "@/components/documents-table"
import { UploadDialog } from "@/components/upload-dialog"

export default async function DocumentsPage() {
  const docs = await getDocuments()

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">Documentos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Todos tus documentos con su versión actual y hash de integridad.
          </p>
        </div>
        <UploadDialog mode="create" />
      </div>

      <div className="mt-6">
        <DocumentsTable documents={docs} />
      </div>
    </div>
  )
}
