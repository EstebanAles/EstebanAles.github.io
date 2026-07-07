import { pgTable, text, timestamp, boolean, serial, integer, bigint } from "drizzle-orm/pg-core"

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// --- App tables ------------------------------------------------------------

// A logical document. Each document points to its current (latest) version.
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  title: text("title").notNull(),
  category: text("category").notNull().default("General"),
  description: text("description"),
  status: text("status").notNull().default("active"),
  currentVersion: integer("currentVersion").notNull().default(1),
  // Latest content hash — mirrors the head of the ledger for quick lookups.
  currentHash: text("currentHash").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// Immutable ledger: an append-only, hash-chained history of every action taken
// on a document. Each entry stores the hash of the previous entry so tampering
// with any record breaks the chain (blockchain-style integrity/traceability).
export const ledger = pgTable("ledger", {
  id: serial("id").primaryKey(),
  documentId: integer("documentId").notNull(),
  userId: text("userId").notNull(),
  // Name/email captured at write time for traceability even if user changes.
  actorName: text("actorName").notNull(),
  actorEmail: text("actorEmail").notNull(),
  // CREATE | UPDATE | VIEW
  action: text("action").notNull(),
  version: integer("version").notNull(),
  // File metadata for this version.
  fileName: text("fileName"),
  fileUrl: text("fileUrl"),
  fileSize: bigint("fileSize", { mode: "number" }),
  fileType: text("fileType"),
  // SHA-256 of the file content (integrity of the document itself).
  contentHash: text("contentHash").notNull(),
  // Hash of the previous ledger entry for this document (chain link).
  previousHash: text("previousHash").notNull(),
  // SHA-256 of this whole record => the block hash.
  blockHash: text("blockHash").notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})
