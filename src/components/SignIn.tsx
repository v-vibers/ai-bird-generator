import { useSubscribeDev } from '@subscribe.dev/react'
import './SignIn.css'

export function SignIn() {
  const { signIn } = useSubscribeDev()

  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-icon">🐦</div>
        <h1>AI Bird Video Generator</h1>
        <p className="signin-description">
          Create stunning AI-generated bird videos with just a simple prompt.
          Sign in to start creating your unique bird videos.
        </p>
        <button className="signin-button" onClick={signIn}>
          Sign In to Get Started
        </button>
        <div className="signin-features">
          <div className="feature-item">
            <span className="feature-icon">✨</span>
            <span>AI-Powered Generation</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎬</span>
            <span>High-Quality Videos</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <span>Fast Processing</span>
          </div>
        </div>
      </div>
    </div>
  )
}