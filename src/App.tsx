import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-6">
          Calendar App
        </h1>
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Vite + React v19 + TypeScript v5.6 + Tailwind CSS v4
          </p>
          <button 
            type="button"
            onClick={() => setCount((count) => count + 1)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Count: {count}
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Click the button to test React state management
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
