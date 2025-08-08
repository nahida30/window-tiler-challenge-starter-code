import React, { useState } from "react"

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
          <div className="h-8 bg-black bg-opacity-20 flex justify-between items-center px-2 text-sm cursor-move">
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