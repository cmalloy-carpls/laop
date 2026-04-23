import { api } from '@/trpc/server'
import Link from 'next/link'

export default async function EngagementPage({ params }: { params: { id: string } }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await (api.engagement.get as any)({ id: params.id }) as {
    engagement: { id: string; status: string; service_type: string; opened_at: Date | null }
    matter: { id: string }
    person: { id: string; primary_name: unknown }
    problem: { id: string; label: string }
  } | null

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto">
        <p className="text-gray-500">Engagement not found.</p>
        <Link href="/dashboard" className="text-brand-600 text-sm hover:underline">← Dashboard</Link>
      </div>
    )
  }

  const { engagement, matter, person, problem } = data
  const name = (person.primary_name as any)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <Link href="/dashboard" className="hover:text-gray-600">Dashboard</Link>
        <span>/</span>
        <Link href="/engagements" className="hover:text-gray-600">Engagements</Link>
        <span>/</span>
        <span className="text-gray-700">{name?.first} {name?.last}</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{name?.first} {name?.last}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{problem.label}</p>
        </div>
        <span className={[
          'px-2.5 py-1 rounded-full text-xs font-medium capitalize',
          engagement.status === 'open' ? 'bg-green-100 text-green-700' :
          engagement.status === 'closed' ? 'bg-gray-100 text-gray-600' :
          'bg-yellow-100 text-yellow-700'
        ].join(' ')}>
          {engagement.status}
        </span>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
        {[
          ['Service type', engagement.service_type],
          ['Status',       engagement.status],
          ['Opened',       engagement.opened_at ? new Date(engagement.opened_at).toLocaleDateString() : '—'],
          ['Matter ID',    matter.id.slice(0, 8) + '…'],
          ['Person ID',    person.id.slice(0, 8) + '…'],
        ].map(([label, value]) => (
          <div key={label as string} className="flex justify-between px-5 py-3 text-sm">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-gray-900">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
