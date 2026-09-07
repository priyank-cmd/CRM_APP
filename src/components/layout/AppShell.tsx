import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

interface AppShellProps {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}

export function AppShell({ title, description, action, children }: AppShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-paper">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-hairline px-8 py-6">
          <div>
            <h1 className="font-display text-[28px] font-medium leading-none text-ink">{title}</h1>
            {description && <p className="mt-1.5 text-sm text-ink-soft">{description}</p>}
          </div>
          {action}
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto px-8 py-6">{children}</main>
      </div>
    </div>
  )
}
