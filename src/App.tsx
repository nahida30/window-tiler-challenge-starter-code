import React, { useEffect, useRef, useState } from "react"

type WindowType = {
  id: number
  x: number
  y: number
  width: number
  height: number
  color: string
  snapped: boolean
  name: string
}

const getRandomColor = () =>
  `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`

const getRandomPosition = () => ({
  x: Math.floor(Math.random() * 500),
  y: Math.floor(Math.random() * 300),
})

let nextId = 1

export default function TilingWindowSystem() {
  const [windows, setWindows] = useState<WindowType[]>([])
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [snapIndicator, setSnapIndicator] = useState<null | "left" | "right" | "top" | "bottom">(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const addWindow = () => {
    const id = nextId++
    const { x, y } = getRandomPosition()
    setWindows((prev) => [
      ...prev,
      {
        id,
        x,
        y,
        width: 300,
        height: 200,
        color: getRandomColor(),
        snapped: false,
        name: `Window ${id}`,
      },
    ])
  }

  const closeWindow = (id: number) => {
    setWindows((prev) => prev.filter((w) => w.id !== id))
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, id: number) => {
    const win = windows.find((w) => w.id === id)
    if (!win) return
    setDraggingId(id)
    setDragOffset({ x: e.clientX - win.x, y: e.clientY - win.y })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (draggingId === null) return
    const x = e.clientX - dragOffset.x
    const y = e.clientY - dragOffset.y

    setWindows((prev) =>
      prev.map((w) =>
        w.id === draggingId ? { ...w, x, y, snapped: false } : w
      )
    )

    const container = containerRef.current
    if (!container) return
    const bounds = container.getBoundingClientRect()

    let indicator: typeof snapIndicator = null
    if (Math.abs(x) < 30) indicator = "left"
    else if (Math.abs(x + 300 - bounds.width) < 30) indicator = "right"
    else if (Math.abs(y) < 30) indicator = "top"
    else if (Math.abs(y + 200 - bounds.height) < 30) indicator = "bottom"

    setSnapIndicator(indicator)
  }

  const handleMouseUp = () => {
    if (draggingId === null) return
    const win = windows.find((w) => w.id === draggingId)
    if (!win || !containerRef.current) return

    const bounds = containerRef.current.getBoundingClientRect()
    let snapped = false
    let newX = win.x
    let newY = win.y
    let newW = win.width
    let newH = win.height

    if (Math.abs(win.x) < 30) {
      newX = 0
      newW = bounds.width / 2
      newH = bounds.height
      newY = 0
      snapped = true
    } else if (Math.abs(win.x + win.width - bounds.width) < 30) {
      newX = bounds.width / 2
      newW = bounds.width / 2
      newH = bounds.height
      newY = 0
      snapped = true
    } else if (Math.abs(win.y) < 30) {
      newY = 0
      newH = bounds.height / 2
      newW = bounds.width
      newX = 0
      snapped = true
    } else if (Math.abs(win.y + win.height - bounds.height) < 30) {
      newY = bounds.height / 2
      newH = bounds.height / 2
      newW = bounds.width
      newX = 0
      snapped = true
    }

    setWindows((prev) =>
      prev.map((w) =>
        w.id === draggingId
          ? {
              ...w,
              x: newX,
              y: newY,
              width: snapped ? newW : 300,
              height: snapped ? newH : 200,
              snapped,
            }
          : w
      )
    )
    setDraggingId(null)
    setSnapIndicator(null)
  }

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  })

  return (
    <div ref={containerRef} className="relative w-screen h-screen bg-gray-100 overflow-hidden">
      {
        snapIndicator && (
          <div className={`absolute bg-black opacity-30 z-40 pointer-events-none transition-all duration-150 ${
            snapIndicator === 'left'
            ? "left-0 top-0 h-full w-1/2"
            : snapIndicator === 'right'
            ? "right-0 top-0 h-full w-1/2"
            : snapIndicator === 'top'
            ? "top-0 left-0 w-full h-1/2"
            : snapIndicator === 'bottom'
            ? "bottom-0 left-0 w-full h-1/2"
            : ""
          }`}>

          </div>
        )
      }
     
      {windows.map((win) => (
        <div
          key={win.id}
          className="absolute rounded shadow transition-all"
          style={{
            left: win.x,
            top: win.y,
            width: win.width,
            height: win.height,
            backgroundColor: win.color,
          }}
        >
          <div className="h-8 bg-black bg-opacity-20 flex justify-between items-center px-2 text-sm cursor-move" onMouseDown={(e) => handleMouseDown(e, win.id)}>
            <span className="text-white">{win.name}</span>
            <button
              onClick={() => closeWindow(win.id)}
              className="text-red-500 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addWindow}
        className="absolute bottom-5 right-5 w-12 h-12 bg-blue-500 text-white rounded-full text-xl shadow-md hover:bg-blue-600"
      >
        +
      </button>
    </div>
  )
}