import { api } from '@/trpc/server'
import Link from 'next/link'

export default async function PeoplePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const people = await (api.person.list as any)() as Array<{
    id: string
    primary_name: { first: string; last: string; middle?: string | null } | null
    date_of_birth: string | null
    status: string
    created_at: Date
  }>

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">People</h1>
          <p className="text-sm text-gray-500 mt-0.5">{people.length} active record{people.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/intake"
          className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-md hover:bg-brand-700"
        >
          + New intake
        </Link>
      </div>

      {people.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">No people yet. Start an intake to add someone.</p>
          <Link href="/intake" className="mt-3 inline-block text-brand-600 text-sm hover:underline">
            Start intake →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
            <span>Name</span>
            <span>DOB</span>
            <span>Added</span>
          </div>
          {people.map((p) => {
            const name = p.primary_name as any
            return (
              <div key={p.id} className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 items-center hover:bg-gray-50">
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    {name?.last}, {name?.first}{name?.middle ? ` ${name.middle}` : ''}
                  </span>
                  <span className="ml-2 text-xs text-gray-400 font-mono">{p.id.slice(0, 8)}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {p.date_of_birth ?? '—'}
                </span>
                <span className="text-sm text-gray-400">
                  {new Date(p.created_at).toLocaleDateString()}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
