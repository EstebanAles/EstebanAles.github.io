"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { documents, ledger } from "@/lib/db/schema"
import { computeBlockHash, GENESIS_HASH, sha256, verifyChain } from "@/lib/blockchain"
import { and, desc, eq, sql } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob"

async function getSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user
}

export interface DocumentListItem {
  id: number
  title: string
  category: string
  description: string | null
  currentVersion: number
  currentHash: string
  updatedAt: Date
  createdAt: Date
}

/** All documents belonging to the current user, newest first. */
export async function getDocuments(): Promise<DocumentListItem[]> {
  const userId = (await getSessionUser()).id
  const rows = await db
    .select({
      id: documents.id,
      title: documents.title,
      category: documents.category,
      description: documents.description,
      currentVersion: documents.currentVersion,
      currentHash: documents.currentHash,
      updatedAt: documents.updatedAt,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(eq(documents.userId, userId))
    .orderBy(desc(documents.updatedAt))
  return rows
}

/** Aggregate stats for the dashboard cards. */
export async function getStats() {
  const userId = (await getSessionUser()).id
  const [docCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(documents)
    .where(eq(documents.userId, userId))
  const [eventCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(ledger)
    .where(eq(ledger.userId, userId))
  const [catCount] = await db
    .select({ count: sql<number>`count(distinct ${documents.category})::int` })
    .from(documents)
    .where(eq(documents.userId, userId))
  return {
    documents: docCount?.count ?? 0,
    events: eventCount?.count ?? 0,
    categories: catCount?.count ?? 0,
  }
}

/** Full ledger history for one document (scoped to the owner). */
export async function getDocumentHistory(documentId: number) {
  const userId = (await getSessionUser()).id
  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, documentId), eq(documents.userId, userId)))
  if (!doc) throw new Error("Document not found")

  const entries = await db
    .select()
    .from(ledger)
    .where(eq(ledger.documentId, documentId))
    .orderBy(ledger.id)

  const chain = verifyChain(
    entries.map((e) => ({
      documentId: e.documentId,
      version: e.version,
      action: e.action,
      actorEmail: e.actorEmail,
      contentHash: e.contentHash,
      previousHash: e.previousHash,
      blockHash: e.blockHash,
      createdAt: e.createdAt,
    })),
  )

  return { document: doc, entries, chain }
}

/** Recent activity across all of the user's documents (for the dashboard feed). */
export async function getRecentActivity(limit = 12) {
  const userId = (await getSessionUser()).id
  return db
    .select()
    .from(ledger)
    .where(eq(ledger.userId, userId))
    .orderBy(desc(ledger.id))
    .limit(limit)
}

/**
 * Uploads a new document (first version). Stores the file in Blob, computes
 * the content hash and the genesis block of the document's hash chain.
 */
export async function createDocument(formData: FormData) {
  const user = await getSessionUser()
  const title = String(formData.get("title") ?? "").trim()
  const category = String(formData.get("category") ?? "General").trim() || "General"
  const description = String(formData.get("description") ?? "").trim() || null
  const note = String(formData.get("note") ?? "").trim() || null
  const file = formData.get("file") as File | null

  if (!title) throw new Error("El título es obligatorio")
  if (!file || file.size === 0) throw new Error("Debes seleccionar un archivo")

  const bytes = Buffer.from(await file.arrayBuffer())
  const contentHash = sha256(bytes)

  const blob = await put(`documents/${user.id}/${Date.now()}-${file.name}`, bytes, {
    access: "private",
    contentType: file.type || "application/octet-stream",
  })
  const fileUrl = `/api/file?pathname=${encodeURIComponent(blob.pathname)}`

  const timestamp = new Date()
  const iso = timestamp.toISOString()
  const version = 1
  const previousHash = GENESIS_HASH

  // Create the document row first to obtain its id.
  const [doc] = await db
    .insert(documents)
    .values({
      userId: user.id,
      title,
      category,
      description,
      currentVersion: version,
      currentHash: contentHash,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .returning()

  const blockHash = computeBlockHash({
    documentId: doc.id,
    version,
    action: "CREATE",
    actorEmail: user.email,
    contentHash,
    previousHash,
    timestamp: iso,
  })

  await db.insert(ledger).values({
    documentId: doc.id,
    userId: user.id,
    actorName: user.name,
    actorEmail: user.email,
    action: "CREATE",
    version,
    fileName: file.name,
    fileUrl,
    fileSize: bytes.length,
    fileType: file.type || null,
    contentHash,
    previousHash,
    blockHash,
    note,
    createdAt: timestamp,
  })

  revalidatePath("/dashboard")
  return { id: doc.id }
}

/**
 * Uploads a new version of an existing document, appending a block whose
 * previousHash points to the current head of the chain.
 */
export async function addDocumentVersion(formData: FormData) {
  const user = await getSessionUser()
  const documentId = Number(formData.get("documentId"))
  const note = String(formData.get("note") ?? "").trim() || null
  const file = formData.get("file") as File | null

  if (!documentId) throw new Error("Documento inválido")
  if (!file || file.size === 0) throw new Error("Debes seleccionar un archivo")

  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, documentId), eq(documents.userId, user.id)))
  if (!doc) throw new Error("Document not found")

  // Head of the chain = most recent ledger entry for this document.
  const [head] = await db
    .select({ blockHash: ledger.blockHash })
    .from(ledger)
    .where(eq(ledger.documentId, documentId))
    .orderBy(desc(ledger.id))
    .limit(1)
  const previousHash = head?.blockHash ?? GENESIS_HASH

  const bytes = Buffer.from(await file.arrayBuffer())
  const contentHash = sha256(bytes)
  const blob = await put(`documents/${user.id}/${Date.now()}-${file.name}`, bytes, {
    access: "private",
    contentType: file.type || "application/octet-stream",
  })
  const fileUrl = `/api/file?pathname=${encodeURIComponent(blob.pathname)}`

  const timestamp = new Date()
  const iso = timestamp.toISOString()
  const version = doc.currentVersion + 1

  const blockHash = computeBlockHash({
    documentId,
    version,
    action: "UPDATE",
    actorEmail: user.email,
    contentHash,
    previousHash,
    timestamp: iso,
  })

  await db.insert(ledger).values({
    documentId,
    userId: user.id,
    actorName: user.name,
    actorEmail: user.email,
    action: "UPDATE",
    version,
    fileName: file.name,
    fileUrl,
    fileSize: bytes.length,
    fileType: file.type || null,
    contentHash,
    previousHash,
    blockHash,
    note,
    createdAt: timestamp,
  })

  await db
    .update(documents)
    .set({
      currentVersion: version,
      currentHash: contentHash,
      updatedAt: timestamp,
    })
    .where(and(eq(documents.id, documentId), eq(documents.userId, user.id)))

  revalidatePath("/dashboard")
  revalidatePath(`/dashboard/documents/${documentId}`)
  return { version }
}
