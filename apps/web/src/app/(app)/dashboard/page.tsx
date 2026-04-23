import { getSession } from '@/lib/auth'

export default async function DashboardPage() {
  const session = await getSession()
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-8">Welcome back. Start an intake or search for a person.</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Open Engagements', value: '—' },
          { label: 'Pending Conflicts', value: '—' },
          { label: 'Referrals Out',     value: '—' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-lg border border-gray-200 p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-400">
        Session: {session?.userId} · Org: {session?.organizationId}
      </div>
    </div>
  )
}
