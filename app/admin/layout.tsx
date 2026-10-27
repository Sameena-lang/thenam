import './admin.css'
import { getAuthenticatedAdmin } from '@/lib/auth'
import AdminShell from './AdminShell'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin Dashboard | THENAM Software Solutions',
  description: 'Centralized Administrative Management for THENAM Software Solutions',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await getAuthenticatedAdmin()

  return (
    <div className="adm-root">
      <AdminShell admin={admin ? { id: admin.id, name: admin.name, email: admin.email, role: admin.role } : null}>
        {children}
      </AdminShell>
    </div>
  )
}
