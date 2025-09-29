import { useState } from 'react'
import { useSubscribeDev } from '@subscribe.dev/react'
import { Header } from './Header'
import './BirdVideoGenerator.css'

type VideoHistory = {
  id: string
  prompt: string
  videoUrl: string
  createdAt: number
}

type GenerationError = {
  type: 'insufficient_credits' | 'rate_limit_exceeded' | 'network' | 'unknown'
  message: string
  retryAfter?: number
}

export function BirdVideoGenerator() {
  const { client, useStorage } = useSubscribeDev()

  const [history, setHistory, syncStatus] = useStorage!<VideoHistory[]>('bird-video-history', [])
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<GenerationError | null>(null)
  const [retryTimer, setRetryTimer] = useState<number | null>(null)

  const handleGenerate = async () => {
    if (!client || !prompt.trim()) return

    setIsGenerating(true)
    setError(null)

    try {
      const response = await client.run('wan-video/wan-2.2-5b-fast', {
        input: {
          prompt: `A beautiful bird ${prompt}`,
          aspect_ratio: '16:9',
        },
      })

      const [videoUrl] = response.output

      const newVideo: VideoHistory = {
        id: Date.now().toString(),
        prompt,
        videoUrl: videoUrl as string,
        createdAt: Date.now(),
      }

      setHistory([newVideo, ...history])
      setPrompt('')
    } catch (err: any) {
      console.error('Generation failed:', err)

      if (err.type === 'insufficient_credits') {
        setError({
          type: 'insufficient_credits',
          message: 'Insufficient credits. Please upgrade your plan to continue generating videos.',
        })
      } else if (err.type === 'rate_limit_exceeded') {
        const retryAfterMs = err.retryAfter || 60000
        setError({
          type: 'rate_limit_exceeded',
          message: `Rate limit exceeded. Please try again in ${Math.ceil(retryAfterMs / 1000)} seconds.`,
          retryAfter: retryAfterMs,
        })
        setRetryTimer(retryAfterMs)

        const interval = setInterval(() => {
          setRetryTimer((prev) => {
            if (prev && prev > 1000) {
              return prev - 1000
            }
            clearInterval(interval)
            return null
          })
        }, 1000)
      } else {
        setError({
          type: err.message?.includes('network') || err.message?.includes('fetch') ? 'network' : 'unknown',
          message: err.message || 'An error occurred while generating the video. Please try again.',
        })
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isGenerating) {
      handleGenerate()
    }
  }

  const deleteVideo = (id: string) => {
    setHistory(history.filter((v) => v.id !== id))
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="generator-container">
      <Header />

      <main className="generator-main">
        <div className="generator-content">
          <div className="generator-section">
            <h2 className="section-title">Generate Bird Video</h2>
            <p className="section-description">
              Describe the bird behavior or scene you want to create
            </p>

            <div className="input-section">
              <div className="input-wrapper">
                <span className="input-prefix">A beautiful bird</span>
                <input
                  type="text"
                  className="prompt-input"
                  placeholder="flying over a sunset, perched on a branch, etc."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isGenerating}
                />
              </div>

              <button
                className="generate-btn"
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim() || retryTimer !== null}
              >
                {isGenerating ? (
                  <>
                    <span className="spinner"></span>
                    Generating...
                  </>
                ) : retryTimer !== null ? (
                  `Retry in ${Math.ceil(retryTimer / 1000)}s`
                ) : (
                  <>
                    <span>🎬</span>
                    Generate Video
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className={`error-message error-${error.type}`}>
                <span className="error-icon">⚠️</span>
                <div className="error-content">
                  <p>{error.message}</p>
                  {error.type === 'insufficient_credits' && (
                    <button
                      className="upgrade-btn"
                      onClick={() => {
                        const { subscribe } = useSubscribeDev()
                        subscribe?.()
                      }}
                    >
                      Upgrade Plan
                    </button>
                  )}
                  {(error.type === 'network' || error.type === 'unknown') && (
                    <button className="retry-btn" onClick={handleGenerate}>
                      Retry
                    </button>
                  )}
                </div>
              </div>
            )}

            {syncStatus === 'syncing' && (
              <div className="sync-status">
                <span className="sync-icon">🔄</span>
                Syncing...
              </div>
            )}
            {syncStatus === 'error' && (
              <div className="sync-status error">
                <span className="sync-icon">❌</span>
                Sync error. Your history may not be saved.
              </div>
            )}
          </div>

          <div className="history-section">
            <h2 className="section-title">Your Videos ({history.length})</h2>

            {history.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎬</div>
                <p>No videos yet. Generate your first bird video above!</p>
              </div>
            ) : (
              <div className="video-grid">
                {history.map((video) => (
                  <div key={video.id} className="video-card">
                    <div className="video-wrapper">
                      <video
                        src={video.videoUrl}
                        controls
                        className="video-player"
                        preload="metadata"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    <div className="video-info">
                      <p className="video-prompt">"{video.prompt}"</p>
                      <div className="video-meta">
                        <span className="video-date">{formatDate(video.createdAt)}</span>
                        <button
                          className="delete-btn"
                          onClick={() => deleteVideo(video.id)}
                          aria-label="Delete video"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}