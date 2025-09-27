import { useEffect, useRef, useState } from 'react'

export default function useTimer(minutes, onExpire) {
  const [remaining, setRemaining] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [timeUp, setTimeUp] = useState(false)
  const intervalRef = useRef(null)

  // Initialize timer when minutes changes
  useEffect(() => {
    if (minutes > 0) {
      setRemaining(minutes * 60)
      setIsActive(true)
      setTimeUp(false)
      console.log(`🕐 Timer initialized: ${minutes} minutes (${minutes * 60} seconds)`)
    }
  }, [minutes])

  // Start/stop timer based on isActive
  useEffect(() => {
    if (isActive && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            console.log('⏰ Timer expired!')
            setIsActive(false)
            setTimeUp(true)
            onExpire?.()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }

    return () => clearInterval(intervalRef.current)
  }, [isActive, remaining, onExpire])

  const minutesPart = Math.floor(remaining / 60)
  const secondsPart = remaining % 60

  return { 
    remaining, 
    minutes: minutesPart, 
    seconds: secondsPart, 
    isActive,
    timeUp,
    start: () => setIsActive(true),
    stop: () => setIsActive(false),
    reset: (newMinutes) => {
      setRemaining(newMinutes * 60)
      setIsActive(true)
      setTimeUp(false)
    }
  }
}
