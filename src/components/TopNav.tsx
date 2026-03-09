import { useEffect, useRef, useState } from 'react'
import type { AppUser } from '../types/models'

type Props = {
  currentUser: AppUser
  navigate: (to: string) => void
  onLogout: () => void
}

export function TopNav({ currentUser, navigate, onLogout }: Props) {
  const [showProfile, setShowProfile] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)

  function handleNavigate(to: string) {
    setShowMobileMenu(false)
    setShowProfile(false)
    navigate(to)
  }

  function handleLogoutClick() {
    setShowMobileMenu(false)
    setShowProfile(false)
    onLogout()
  }

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (profileMenuRef.current?.contains(event.target as Node)) {
        return
      }

      setShowProfile(false)
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowProfile(false)
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  return (
    <header className="top-nav">
      <div className="brand">IT Asset & Maintenance Manager</div>
      <button
        className="ghost nav-toggle"
        aria-expanded={showMobileMenu}
        aria-controls="top-nav-links"
        aria-label="Toggle navigation menu"
        onClick={() => setShowMobileMenu((prev) => !prev)}
      >
        ☰
      </button>
      <nav id="top-nav-links" className={showMobileMenu ? 'open' : ''}>
        <button onClick={() => handleNavigate('/dashboard')}>Dashboard</button>
        <button onClick={() => handleNavigate('/assets')}>Assets</button>
        <button onClick={() => handleNavigate('/tickets')}>
          {currentUser.role === 'admin' ? 'Tickets' : 'My Tickets'}
        </button>
        {currentUser.role === 'admin' && <button onClick={() => handleNavigate('/users')}>Users</button>}
        <div className="profile-menu" ref={profileMenuRef}>
          <button
            className="ghost profile-trigger"
            aria-expanded={showProfile}
            aria-haspopup="true"
            aria-label="Open profile menu"
            onClick={() => setShowProfile((prev) => !prev)}
          >
            <span className="profile-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5Zm0 2c-3.34 0-10 1.68-10 5v3h20v-3c0-3.32-6.66-5-10-5Z" />
              </svg>
            </span>
          </button>
          {showProfile && (
            <div className="profile-popover" role="dialog" aria-label="Logged in user profile">
              <p className="profile-name">{currentUser.username}</p>
              <p className="profile-meta">{currentUser.email}</p>
              <p className="profile-meta">Role: {currentUser.role}</p>
              <button className="profile-logout" onClick={handleLogoutClick}>
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
