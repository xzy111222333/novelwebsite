import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/session"
import { AdminPanel } from "@/components/admin/AdminPanel"

export default async function AdminPage() {
  try {
    await requireAdmin()
  } catch {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <AdminPanel />
      </div>
    </div>
  )
}
