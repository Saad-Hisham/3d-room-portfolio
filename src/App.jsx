import Scene from './Components/Scene'
import BasicLoader from './Components/BasicLoader'
import { useEffect, useRef, useState } from 'react'
function App() {
  const [hasEntered, setHasEntered] = useState(false)
    const [musicLevel, setMusicLevel] = useState(2)
    const backgroundMusicRef = useRef(null)
  
  useEffect(() => {
    const levels = [0, 0.12, 0.25]
    const music = new Audio('/music.mp3')
    music.loop = true
    music.volume = levels[musicLevel]
    backgroundMusicRef.current = music

    const tryPlayMusic = () => {
      music.play().catch(() => { })
    }

    const handleFirstInteraction = () => {
      tryPlayMusic()
      window.removeEventListener('pointerdown', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }

    tryPlayMusic()
    window.addEventListener('pointerdown', handleFirstInteraction)
    window.addEventListener('keydown', handleFirstInteraction)

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
      music.pause()
      music.currentTime = 0
      if (backgroundMusicRef.current === music) {
        backgroundMusicRef.current = null
      }
    }
  }, [])

      useEffect(() => {
        const levels = [0, 0.12, 0.25]
        if (backgroundMusicRef.current) {
          backgroundMusicRef.current.volume = levels[musicLevel]
          if (musicLevel === 0) {
            backgroundMusicRef.current.pause()
          } else {
            backgroundMusicRef.current.play().catch(() => { })
          }
        }
      }, [musicLevel])
    
  const cycleMusicLevel = () => {
    setMusicLevel((prev) => (prev + 1) % 3)
  }

  return (
    <>
      <BasicLoader onEnter={() => setHasEntered(true)} />
      
      <div>
        <Scene hasEntered={hasEntered} />
        <button
          className="music-control-button"
          onClick={cycleMusicLevel}
          aria-label="Toggle music volume"
          title={musicLevel === 0 ? 'Music off' : musicLevel === 1 ? 'Music low' : 'Music on'}
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '999px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: musicLevel === 0
              ? 'rgba(30, 30, 30, 0.85)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
            color: '#fff',
            transition: 'all 0.2s ease',
            position: 'fixed',
            bottom: '9px',
            right: '16px',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 9H4V15H7L12 19V5L7 9Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {musicLevel > 0 && (
              <>
                <path
                  d="M16 8C17.2 9.1 18 10.5 18 12C18 13.5 17.2 14.9 16 16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {musicLevel === 2 && (
                  <path
                    d="M19 5C20.8 6.8 22 9.3 22 12C22 14.7 20.8 17.2 19 19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                )}
              </>
            )}
            {musicLevel === 0 && (
              <path
                d="M20 8L14 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>
    </>
  )
}

export default App
