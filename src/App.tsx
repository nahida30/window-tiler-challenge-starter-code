import React, { useEffect, useRef, useState } from "react"

type WindowType = {
  id: number
  x: number
  y: number
  width: number
  height: number
  color: string
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
  const offset = useRef({x:0, y:0})

  const addWindow = () => {
    const { x, y } = getRandomPosition()
    setWindows((prev) => [
      ...prev,
      {
        id: nextId++,
        x,
        y,
        width: 300,
        height: 200,
        color: getRandomColor(),
      },
    ])
  }

  const closeWindow = (id: number) => {
    setWindows((prev) => prev.filter((w) => w.id !== id))
  }

  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    win: WindowType
  ) => {
    e.stopPropagation()
    setDraggingId(win.id)
    offset.current = {
      x: e.clientX - win.x,
      y: e.clientY - win.y,
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (draggingId === null) return
    setWindows((prev) => 
    prev.map((w) =>
      w.id === draggingId
    ? {
      ...w,
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    }
    : w
    ))
  }

  const handleMouseUp = () => {
    setDraggingId(null)
  }

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [draggingId])

  return (
    <div className="relative w-screen h-screen bg-gray-100 overflow-hidden">
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
          <div className="h-8 bg-black bg-opacity-20 flex justify-between items-center px-2 text-sm cursor-move" onMouseDown={(e) => handleMouseDown(e, win)}>
            <span>Window</span>
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