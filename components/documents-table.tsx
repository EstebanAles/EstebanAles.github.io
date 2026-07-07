"use client"

import Link from "next/link"
import { FileText, ChevronRight } from "lucide-react"
import type { DocumentListItem } from "@/app/actions/documents"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate, shortHash } from "@/lib/format"

export function DocumentsTable({ documents }: { documents: DocumentListItem[] }) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-sm font-medium text-foreground">Aún no hay documentos</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Sube tu primer documento para registrar su primer bloque en la cadena de trazabilidad.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Documento</TableHead>
            <TableHead className="hidden sm:table-cell">Categoría</TableHead>
            <TableHead className="hidden md:table-cell">Versión</TableHead>
            <TableHead className="hidden lg:table-cell">Hash actual</TableHead>
            <TableHead className="hidden sm:table-cell">Actualizado</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id} className="cursor-pointer">
              <TableCell>
                <Link href={`/dashboard/documents/${doc.id}`} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{doc.title}</p>
                    {doc.description ? (
                      <p className="truncate text-xs text-muted-foreground">{doc.description}</p>
                    ) : null}
                  </div>
                </Link>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge variant="secondary" className="font-normal">
                  {doc.category}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                v{doc.currentVersion}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                  {shortHash(doc.currentHash)}
                </code>
              </TableCell>
              <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                {formatDate(doc.updatedAt)}
              </TableCell>
              <TableCell>
                <Link href={`/dashboard/documents/${doc.id}`} aria-label={`Ver ${doc.title}`}>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
