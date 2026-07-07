"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")

  const name = String(formData.get("name") ?? "").trim()
  if (!name) throw new Error("El nombre no puede estar vacío")

  await db
    .update(user)
    .set({ name, updatedAt: new Date() })
    .where(eq(user.id, session.user.id))

  revalidatePath("/dashboard/profile")
  revalidatePath("/dashboard")
  return { success: true }
}
