import { Radar, Rows3, TrendingUp } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useCrmStore } from '../../store/useCrmStore'
import { computeKpis } from '../../lib/analytics'
import { formatCompactCurrency } from '../../lib/format'
import { ThemeToggle } from '../ui/ThemeToggle'

const NAV_ITEMS = [
  { to: '/leads', label: 'Leads', icon: Rows3 },
  { to: '/pipeline', label: 'Pipeline', icon: TrendingUp },
  { to: '/analytics', label: 'Analytics', icon: Radar },
]

export function Sidebar() {
  const leads = useCrmStore((s) => s.leads)
  const kpis = computeKpis(leads)

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-indigo text-indigo-text">
      <div className="flex items-start justify-between px-6 pt-8 pb-6">
        <div>
          <div className="font-display text-2xl font-medium tracking-tight text-white">Leadspot</div>
          <div className="mt-0.5 text-[11px] text-indigo-text/80">Sales CRM</div>
        </div>
        <ThemeToggle />
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md border-l-2 px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'border-amber bg-white/5 text-white'
                  : 'border-transparent text-indigo-text hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={17} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-6 py-6">
        <div className="rounded-md border border-white/10 bg-white/5 px-4 py-3.5">
          <div className="text-[11px] text-indigo-text/80">Open pipeline</div>
          <div className="tabular mt-1 font-display text-xl text-white">
            {formatCompactCurrency(kpis.openValue)}
          </div>
          <div className="mt-0.5 text-[11px] text-indigo-text/80">{kpis.openCount} active leads</div>
        </div>
      </div>
    </aside>
  )
}
