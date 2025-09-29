import { useSubscribeDev } from '@subscribe.dev/react'
import './Header.css'

export function Header() {
  const { user, usage, subscriptionStatus, subscribe, signOut } = useSubscribeDev()

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="app-title">
          <span className="app-icon">🐦</span>
          <h1>AI Bird Videos</h1>
        </div>
      </div>

      <div className="header-right">
        <div className="usage-info">
          <div className="credits">
            <span className="credits-label">Credits:</span>
            <span className="credits-value">{usage?.remainingCredits ?? 0}</span>
          </div>
          <div className="plan">
            <span className="plan-badge">{subscriptionStatus?.plan?.name ?? 'Free'}</span>
          </div>
        </div>

        <button className="manage-subscription-btn" onClick={subscribe!}>
          Manage Plan
        </button>

        <div className="user-menu">
          <div className="user-avatar">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.email} />
            ) : (
              <div className="avatar-placeholder">{user?.email?.[0].toUpperCase()}</div>
            )}
          </div>
          <button className="signout-btn" onClick={signOut}>
            Sign Out
          </button>
        </div>
      </div>
    </header>
  )
}