import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import clsx from 'clsx'

const links = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/notes', label: 'Notes', icon: '◧' },
  { to: '/chat', label: 'AI Chat', icon: '◈' },
]

function SynapseHexIcon() {
  return (
    <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0" fill="none">
      <polygon points="16,2 29,9 29,23 16,30 3,23 3,9" stroke="#6366f1" strokeWidth="1.5" fill="none" opacity="0.4" />
      <circle cx="16" cy="16" r="4" fill="#6366f1" />
      <line x1="16" y1="2" x2="16" y2="11" stroke="#6366f1" strokeWidth="1" opacity="0.4" />
      <line x1="16" y1="21" x2="16" y2="30" stroke="#6366f1" strokeWidth="1" opacity="0.4" />
      <line x1="3" y1="9" x2="11" y2="13" stroke="#6366f1" strokeWidth="1" opacity="0.4" />
      <line x1="21" y1="19" x2="29" y2="23" stroke="#6366f1" strokeWidth="1" opacity="0.4" />
      <line x1="29" y1="9" x2="21" y2="13" stroke="#6366f1" strokeWidth="1" opacity="0.4" />
      <line x1="11" y1="19" x2="3" y2="23" stroke="#6366f1" strokeWidth="1" opacity="0.4" />
    </svg>
  )
}

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
      <div className="px-4 py-4 border-b border-gray-800 flex items-center gap-2.5">
        <SynapseHexIcon />
        <span className="text-base font-bold text-gray-100 tracking-tight">Synapse</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-500/10 text-indigo-400'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
              )
            }
          >
            <span className="text-base w-4 text-center">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Settings + User */}
      <div className="px-3 pb-3 space-y-0.5">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-indigo-500/10 text-indigo-400'
                : 'text-gray-500 hover:text-gray-100 hover:bg-gray-800'
            )
          }
        >
          <span className="text-base w-4 text-center">⚙</span>
          Settings
        </NavLink>
      </div>

      {/* User */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center gap-3 px-1 py-1.5">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username}
              className="w-7 h-7 rounded-full shrink-0 ring-1 ring-gray-700"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.username?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">{user?.username}</p>
            {user?.github_id && (
              <p className="text-xs text-gray-600 truncate">via GitHub</p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-300 transition-colors text-sm"
            title="Sign out"
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>
  )
}
