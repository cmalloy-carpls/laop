import { api } from '@/trpc/server'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  intake:          'bg-blue-50 text-blue-700',
  'conflict-check':'bg-yellow-50 text-yellow-700',
  eligible:        'bg-teal-50 text-teal-700',
  ineligible:      'bg-red-50 text-red-700',
  open:            'bg-green-100 text-green-700',
  closed:          'bg-gray-100 text-gray-500',
  referred:        'bg-purple-50 text-purple-700',
}

export default async function EngagementsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await (api.engagement.list as any)() as Array<{
    engagement: {
      id: string
      status: string
      service_type: string
      opened_at: Date | null
    }
    person: {
      id: string
      primary_name: unknown
    }
    problem: {
      id: string
      label: string
    }
  }>

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Engagements</h1>
          <p className="text-sm text-gray-500 mt-0.5">{rows.length} total</p>
        </div>
        <Link
          href="/intake"
          className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-md hover:bg-brand-700"
        >
          + New intake
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">No engagements yet.</p>
          <Link href="/intake" className="mt-3 inline-block text-brand-600 text-sm hover:underline">
            Start intake →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
            <span>Caller</span>
            <span>Problem</span>
            <span>Status</span>
            <span>Opened</span>
          </div>
          {rows.map(({ engagement, person, problem }) => {
            const name = person.primary_name as any
            return (
              <Link
                key={engagement.id}
                href={`/engagements/${engagement.id}`}
                className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-5 py-3 items-center hover:bg-gray-50 group"
              >
                <span className="text-sm font-medium text-gray-900 group-hover:text-brand-600">
                  {name?.first} {name?.last}
                </span>
                <span className="text-sm text-gray-500 truncate">{problem.label}</span>
                <span className={[
                  'px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap',
                  statusColors[engagement.status] ?? 'bg-gray-100 text-gray-600',
                ].join(' ')}>
                  {engagement.status}
                </span>
                <span className="text-sm text-gray-400 whitespace-nowrap">
                  {engagement.opened_at
                    ? new Date(engagement.opened_at).toLocaleDateString()
                    : '—'}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
