import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import clsx from 'clsx'

const links = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/notes', label: 'Notes', icon: '◧' },
  { to: '/chat', label: 'AI Chat', icon: '◈' },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-56 flex flex-col bg-gray-900 border-r border-gray-800 shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <span className="text-xl font-bold text-synapse-500 tracking-tight">⬡ Synapse</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-synapse-500/10 text-synapse-400'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
              )
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-7 h-7 rounded-full bg-synapse-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {user?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">{user?.username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-300 text-xs transition-colors"
            title="Logout"
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>
  )
}
