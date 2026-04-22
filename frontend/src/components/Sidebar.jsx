import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'

const links = [
  {
    to: '/', label: 'Home', end: true,
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    to: '/notes', label: 'Notes', end: false,
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  },
  {
    to: '/chat', label: 'Chat',  end: false,
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  },
]

function ClaudeLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="#d97041" opacity="0.15" />
      <path d="M20 8 C14 8 10 12 10 18 C10 22 12 25.5 16 27.5 L14 32 L20 29 L26 32 L24 27.5 C28 25.5 30 22 30 18 C30 12 26 8 20 8Z" fill="#d97041" opacity="0.9" />
      <circle cx="16" cy="18" r="2" fill="#1a1713" />
      <circle cx="24" cy="18" r="2" fill="#1a1713" />
      <path d="M16 23 Q20 26 24 23" stroke="#1a1713" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  return (
    <aside
      className="w-52 flex flex-col shrink-0 border-r h-full"
      style={{ background: '#1f1b17', borderColor: '#2d2620' }}
    >
      {/* Logo */}
      <div className="px-4 py-4 flex items-center gap-2.5 border-b" style={{ borderColor: '#2d2620' }}>
        <ClaudeLogo />
        <span className="font-semibold text-sm tracking-tight" style={{ color: '#e8ddd6' }}>Synapse</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {links.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'text-[#d97041] bg-[#d9704118]'
                  : 'text-[#8a7a70] hover:text-[#e8ddd6] hover:bg-[#2e2820]'
              }`
            }
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-2 border-t pt-2" style={{ borderColor: '#2d2620' }}>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'text-[#d97041] bg-[#d9704118]' : 'text-[#4a3f38] hover:text-[#8a7a70] hover:bg-[#2e2820]'
            }`
          }
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </NavLink>

        {/* User chip */}
        <div className="flex items-center gap-2.5 px-3 py-2 mt-1 rounded-lg" style={{ background: '#252118' }}>
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-6 h-6 rounded-full ring-1" style={{ ringColor: '#2d2620' }} />
          ) : (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: '#d97041', color: '#1a1713' }}
            >
              {user?.username?.[0]?.toUpperCase()}
            </div>
          )}
          <span className="flex-1 text-xs font-medium truncate" style={{ color: '#e8ddd6' }}>
            {user?.username}
          </span>
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="transition-colors text-xs"
            style={{ color: '#4a3f38' }}
            title="Sign out"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
