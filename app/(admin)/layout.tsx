import { AdminClientLayout } from "@/components/admin/admin-client-layout"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminClientLayout>{children}</AdminClientLayout>
}
