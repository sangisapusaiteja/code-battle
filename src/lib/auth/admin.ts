import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

/**
 * Server-side admin guard for Code Battle.
 * Returns the admin user's id + username, or redirects non-admins.
 */
export async function requireAdmin() {
  const session = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("users")
    .select("id, username, role")
    .eq("id", session.userId)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  return { userId: session.userId, username: session.username };
}
