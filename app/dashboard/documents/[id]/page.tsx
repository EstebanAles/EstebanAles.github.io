import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getDocumentHistory } from "@/app/actions/documents"
import { DocumentDetail } from "@/components/document-detail"
import { Button } from "@/components/ui/button"

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const documentId = Number(id)
  if (!Number.isFinite(documentId)) notFound()

  let data
  try {
    data = await getDocumentHistory(documentId)
  } catch {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2 text-muted-foreground"
        render={<Link href="/dashboard/documents" />}
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Volver a documentos
      </Button>
      <DocumentDetail
        document={data.document}
        entries={data.entries}
        chain={data.chain}
      />
    </div>
  )
}
