import { OrganizationSwitcher, UserButton } from '@clerk/nextjs'

export function Header() {
  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0">
      <OrganizationSwitcher
        hidePersonal
        appearance={{ elements: { organizationSwitcherTrigger: 'text-sm' } }}
      />
      <UserButton />
    </header>
  )
}
