import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../theme/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      onClick={toggleTheme}
      className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-white/15 bg-white/10 transition-colors hover:bg-white/20"
    >
      <span
        className={`absolute flex h-4 w-4 items-center justify-center rounded-full bg-white text-indigo transition-transform ${
          isDark ? 'translate-x-[22px]' : 'translate-x-[3px]'
        }`}
      >
        {isDark ? <Moon size={10} strokeWidth={2.25} /> : <Sun size={10} strokeWidth={2.25} />}
      </span>
    </button>
  )
}
