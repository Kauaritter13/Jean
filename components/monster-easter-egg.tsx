'use client'

import { useEffect, useRef, useState } from 'react'

export function MonsterEasterEgg() {
  const [showVideo, setShowVideo] = useState(false)
  const keyBufferRef = useRef<string[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignora se estiver digitando em input/textarea
      const target = event.target as HTMLElement
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'
      
      // Adiciona a tecla ao buffer
      const key = event.key.toLowerCase()
      if (key.length === 1 && /[a-z]/.test(key)) {
        keyBufferRef.current.push(key)
        
        // Mantém apenas as últimas 7 letras
        if (keyBufferRef.current.length > 7) {
          keyBufferRef.current.shift()
        }
        
        // Verifica se forma "monster"
        const typed = keyBufferRef.current.join('')
        if (typed.includes('monster')) {
          setShowVideo(true)
          keyBufferRef.current = []
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  useEffect(() => {
    if (showVideo && videoRef.current && audioRef.current) {
      videoRef.current.play()
      audioRef.current.play()
    }
  }, [showVideo])

  const handleVideoEnd = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setShowVideo(false)
  }

  if (!showVideo) return null

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
      onClick={handleVideoEnd}
    >
      <video
        ref={videoRef}
        src="/videos/monster.mp4"
        className="w-full h-full object-contain"
        onEnded={handleVideoEnd}
        autoPlay
        muted
        controls
      />
      <audio
        ref={audioRef}
        src="/sound/monster.mp3"
        preload="auto"
      />
    </div>
  )
}
