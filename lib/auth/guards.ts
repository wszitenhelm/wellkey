import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function redirectIfAuthenticated() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }
}
