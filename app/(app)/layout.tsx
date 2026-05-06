import { ClientLayout } from '@/components/app-shell/client-layout'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
}
