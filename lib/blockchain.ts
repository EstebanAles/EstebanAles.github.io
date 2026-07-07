import { createHash } from "crypto"

// Genesis hash used as the "previous hash" for the very first block of a document.
export const GENESIS_HASH = "0".repeat(64)

/**
 * SHA-256 hex digest of arbitrary content (string or buffer).
 * Used for the content hash of an uploaded file.
 */
export function sha256(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex")
}

export interface BlockInput {
  documentId: number
  version: number
  action: string
  actorEmail: string
  contentHash: string
  previousHash: string
  timestamp: string
}

/**
 * Computes the block hash for a ledger entry by hashing the canonical
 * serialization of its fields together with the previous block's hash.
 * Changing any field of any block breaks every subsequent block hash,
 * which is what makes the chain tamper-evident (blockchain-style).
 */
export function computeBlockHash(input: BlockInput): string {
  const payload = [
    input.documentId,
    input.version,
    input.action,
    input.actorEmail,
    input.contentHash,
    input.previousHash,
    input.timestamp,
  ].join("|")
  return sha256(payload)
}

/** Short, human-friendly representation of a hash for the UI. */
export function shortHash(hash: string): string {
  if (!hash) return ""
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`
}

export interface VerifiableBlock {
  documentId: number
  version: number
  action: string
  actorEmail: string
  contentHash: string
  previousHash: string
  blockHash: string
  createdAt: Date | string
}

/**
 * Re-computes each block hash in order and verifies that:
 *  1. Each block's stored blockHash matches its recomputed hash.
 *  2. Each block's previousHash matches the prior block's blockHash.
 * Returns the index of the first broken block, or -1 if the chain is intact.
 */
export function verifyChain(blocks: VerifiableBlock[]): {
  valid: boolean
  brokenAt: number
} {
  let expectedPrev = GENESIS_HASH
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]
    const ts = typeof b.createdAt === "string" ? b.createdAt : b.createdAt.toISOString()
    const recomputed = computeBlockHash({
      documentId: b.documentId,
      version: b.version,
      action: b.action,
      actorEmail: b.actorEmail,
      contentHash: b.contentHash,
      previousHash: b.previousHash,
      timestamp: ts,
    })
    if (b.previousHash !== expectedPrev || recomputed !== b.blockHash) {
      return { valid: false, brokenAt: i }
    }
    expectedPrev = b.blockHash
  }
  return { valid: true, brokenAt: -1 }
}
