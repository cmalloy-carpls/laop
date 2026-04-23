'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/trpc/client'

type Step = 'person' | 'problem' | 'confirm'

type PersonResult = {
  id: string
  primary_name: { first: string; last: string; middle?: string | null } | null
  date_of_birth: string | null
}

type SelectedProblem = {
  id: string
  label: string
  lsc_code: string | null
}

export default function IntakePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('person')

  // Step 1 — person
  const [query, setQuery] = useState('')
  const [selectedPerson, setSelectedPerson] = useState<PersonResult | null>(null)
  const [creatingNew, setCreatingNew] = useState(false)
  const [newFirst, setNewFirst] = useState('')
  const [newLast, setNewLast] = useState('')
  const [newDob, setNewDob] = useState('')

  // Step 2 — problem
  const [problemSearch, setProblemSearch] = useState('')
  const [selectedProblem, setSelectedProblem] = useState<SelectedProblem | null>(null)

  // tRPC
  const searchResults = api.person.search.useQuery(
    { query, limit: 8 },
    { enabled: query.length >= 2 },
  )
  const problems = api.problem.list.useQuery()
  const createPerson = api.person.create.useMutation()
  const createMatter = api.matter.create.useMutation()
  const createEngagement = api.engagement.create.useMutation()

  const filteredProblems = (problems.data ?? []).filter(
    (p) =>
      p.label.toLowerCase().includes(problemSearch.toLowerCase()) ||
      (p.lsc_code ?? '').includes(problemSearch),
  )

  async function handleSubmit() {
    let personId = selectedPerson?.id
    if (!personId) {
      const p = await createPerson.mutateAsync({
        primaryName: { first: newFirst, last: newLast, middle: null, suffix: null },
      })
      personId = p!.id
    }
    const matter = await createMatter.mutateAsync({
      personId: personId!,
      problemId: selectedProblem!.id,
    })
    const engagement = await createEngagement.mutateAsync({
      matterId: matter!.id,
      serviceType: 'brief-advice',
    })
    router.push(`/engagements/${engagement!.id}`)
  }

  const loading = createPerson.isPending || createMatter.isPending || createEngagement.isPending

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">New Intake</h1>
      <p className="text-sm text-gray-500 mb-6">Find or create a caller, then select their legal problem.</p>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {(['person', 'problem', 'confirm'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={[
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold',
              step === s ? 'bg-brand-600 text-white' :
              (step === 'problem' && s === 'person') || step === 'confirm' ? 'bg-brand-100 text-brand-600' :
              'bg-gray-100 text-gray-400'
            ].join(' ')}>{i + 1}</div>
            <span className={`text-sm ${step === s ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
              {s === 'person' ? 'Caller' : s === 'problem' ? 'Problem' : 'Confirm'}
            </span>
            {i < 2 && <div className="w-8 h-px bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 1: Person */}
      {step === 'person' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-base font-medium text-gray-900 mb-4">Find caller</h2>

          {!creatingNew ? (
            <>
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedPerson(null) }}
                placeholder="Search by first or last name…"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 mb-3"
              />
              {searchResults.isFetching && (
                <p className="text-xs text-gray-400 mb-2">Searching…</p>
              )}
              {(searchResults.data ?? []).length > 0 && !selectedPerson && (
                <ul className="border border-gray-200 rounded-md divide-y divide-gray-100 mb-3">
                  {searchResults.data!.map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => setSelectedPerson(p as PersonResult)}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm"
                      >
                        <span className="font-medium">
                          {(p.primary_name as any)?.first} {(p.primary_name as any)?.last}
                        </span>
                        {p.date_of_birth && (
                          <span className="text-gray-400 ml-2">DOB {p.date_of_birth}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {selectedPerson && (
                <div className="flex items-center justify-between bg-brand-50 rounded-md px-4 py-2.5 mb-3 text-sm">
                  <span className="font-medium text-brand-700">
                    ✓ {selectedPerson.primary_name?.first} {selectedPerson.primary_name?.last}
                  </span>
                  <button onClick={() => setSelectedPerson(null)} className="text-gray-400 hover:text-gray-600 text-xs">Change</button>
                </div>
              )}
              <div className="flex items-center gap-3 mt-4">
                {selectedPerson && (
                  <button
                    onClick={() => setStep('problem')}
                    className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-md hover:bg-brand-700"
                  >
                    Continue
                  </button>
                )}
                <button
                  onClick={() => setCreatingNew(true)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50"
                >
                  + New person
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">First name</label>
                  <input
                    value={newFirst}
                    onChange={(e) => setNewFirst(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Last name</label>
                  <input
                    value={newLast}
                    onChange={(e) => setNewLast(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Date of birth (optional)</label>
                <input
                  type="date"
                  value={newDob}
                  onChange={(e) => setNewDob(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('problem')}
                  disabled={!newFirst || !newLast}
                  className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-md hover:bg-brand-700 disabled:opacity-40"
                >
                  Continue
                </button>
                <button
                  onClick={() => setCreatingNew(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50"
                >
                  Back to search
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 2: Problem */}
      {step === 'problem' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-base font-medium text-gray-900 mb-4">What is the legal problem?</h2>
          <input
            type="text"
            value={problemSearch}
            onChange={(e) => setProblemSearch(e.target.value)}
            placeholder="Search by problem name or LSC code…"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 mb-3"
            autoFocus
          />
          {selectedProblem && (
            <div className="flex items-center justify-between bg-brand-50 rounded-md px-4 py-2.5 mb-3 text-sm">
              <span className="font-medium text-brand-700">✓ {selectedProblem.label}</span>
              <button onClick={() => setSelectedProblem(null)} className="text-gray-400 hover:text-gray-600 text-xs">Change</button>
            </div>
          )}
          {!selectedProblem && (
            <ul className="border border-gray-200 rounded-md divide-y divide-gray-100 max-h-64 overflow-y-auto mb-3">
              {filteredProblems.slice(0, 30).map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => setSelectedProblem(p as SelectedProblem)}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm flex items-center justify-between"
                  >
                    <span>{p.label}</span>
                    {p.lsc_code && <span className="text-xs text-gray-400 font-mono">{p.lsc_code}</span>}
                  </button>
                </li>
              ))}
              {filteredProblems.length === 0 && (
                <li className="px-4 py-3 text-sm text-gray-400">No problems match that search.</li>
              )}
            </ul>
          )}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setStep('confirm')}
              disabled={!selectedProblem}
              className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-md hover:bg-brand-700 disabled:opacity-40"
            >
              Continue
            </button>
            <button
              onClick={() => setStep('person')}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-base font-medium text-gray-900 mb-4">Confirm intake</h2>
          <dl className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Caller</dt>
              <dd className="font-medium text-gray-900">
                {selectedPerson
                  ? `${selectedPerson.primary_name?.first} ${selectedPerson.primary_name?.last}`
                  : `${newFirst} ${newLast} (new)`}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Problem</dt>
              <dd className="font-medium text-gray-900">{selectedProblem?.label}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Service type</dt>
              <dd className="font-medium text-gray-900">Brief advice</dd>
            </div>
          </dl>
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-md hover:bg-brand-700 disabled:opacity-40"
            >
              {loading ? 'Creating…' : 'Start engagement'}
            </button>
            <button
              onClick={() => setStep('problem')}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50"
            >
              Back
            </button>
          </div>
          {createMatter.error && (
            <p className="mt-3 text-sm text-red-600">{createMatter.error.message}</p>
          )}
        </div>
      )}
    </div>
  )
}
