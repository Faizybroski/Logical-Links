'use client'
import React, { useEffect, useRef, useState } from 'react'

const Page = () => {
  const boxRef = useRef<HTMLDivElement | null>(null)

  const [position, setPosition] = useState({
    x: 100,
    y: 100,
  })

  const [velocity, setVelocity] = useState({
    dx: 4,
    dy: 4,
  })

  const [hue, setHue] = useState(0)

  // Moving animation
  useEffect(() => {
    const moveBox = () => {
      setPosition((prev) => {
        const box = boxRef.current

        if (!box) return prev

        const boxWidth = box.offsetWidth
        const boxHeight = box.offsetHeight

        let newX = prev.x + velocity.dx
        let newY = prev.y + velocity.dy

        let newDx = velocity.dx
        let newDy = velocity.dy

        // Bounce horizontally
        if (newX <= 0 || newX + boxWidth >= window.innerWidth) {
          newDx = -newDx
        }

        // Bounce vertically
        if (newY <= 0 || newY + boxHeight >= window.innerHeight) {
          newDy = -newDy
        }

        setVelocity({
          dx: newDx,
          dy: newDy,
        })

        return {
          x: newX,
          y: newY,
        }
      })
    }

    const interval = setInterval(moveBox, 10)

    return () => clearInterval(interval)
  }, [velocity])

  // Continuous color changing
  useEffect(() => {
    const colorInterval = setInterval(() => {
      setHue((prev) => (prev + 1) % 360)
    }, 20)

    return () => clearInterval(colorInterval)
  }, [])

  return (
    <div className="w-screen h-screen overflow-hidden bg-black relative">
      <div
        ref={boxRef}
        className="absolute px-8 py-5 text-3xl font-bold rounded-2xl shadow-2xl transition-colors duration-75"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          backgroundColor: `hsl(${hue}, 100%, 50%)`,
          color: `hsl(${(hue + 180) % 360}, 100%, 90%)`,
        }}
      >
        This is the Home Page
      </div>
    </div>
  )
}

export default Page