'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { label: 'Dashboard', href: '/dashboard', icon: '⊞' },
  { label: 'New Intake',  href: '/intake',    icon: '+' },
  { label: 'People',      href: '/people',    icon: '◉' },
  { label: 'Matters',     href: '/matters',   icon: '⚖' },
  { label: 'Engagements', href: '/engagements', icon: '↔' },
]

export function Sidebar() {
  const path = usePathname()
  return (
    <aside className="flex flex-col w-56 min-h-screen bg-brand-700 text-white shrink-0">
      <div className="px-5 py-4 border-b border-white/10">
        <span className="text-sm font-semibold tracking-wide uppercase text-white/60">LAOP</span>
      </div>
      <nav className="flex flex-col gap-0.5 p-2 flex-1">
        {nav.map(({ label, href, icon }) => (
          <Link
            key={href}
            href={href}
            className={[
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
              path === href
                ? 'bg-white/15 text-white font-medium'
                : 'text-white/70 hover:bg-white/10 hover:text-white',
            ].join(' ')}
          >
            <span className="w-5 text-center">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
