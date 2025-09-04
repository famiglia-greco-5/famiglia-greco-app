 'use client'

import { BellIcon, ClipboardDocumentListIcon, HomeIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import BachecaFamiglia from '../components/BachecaFamiglia'
import ListaSpesa from '../components/ListaSpesa'

type Tab = 'bacheca' | 'lista'

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('bacheca')
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    // Richiedi permesso per le notifiche
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    // Simula notifiche per demo
    const interval = setInterval(() => {
      setNotificationCount(prev => prev + Math.floor(Math.random() * 2))
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-wood-100 to-wood-200">
      {/* Header */}
      <header className="bg-wood-800 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-center font-handwriting">
            🏠 Famiglia Greco
          </h1>
          <p className="text-center text-wood-200 mt-1">
            La nostra bacheca digitale
          </p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b-2 border-wood-300 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center space-x-1">
            <button
              onClick={() => setActiveTab('bacheca')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-200 ${
                activeTab === 'bacheca'
                  ? 'bg-wood-600 text-white border-b-4 border-wood-800'
                  : 'text-wood-700 hover:bg-wood-100'
              }`}
            >
              <HomeIcon className="w-5 h-5" />
              <span>Bacheca</span>
            </button>
            
            <button
              onClick={() => setActiveTab('lista')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-200 relative ${
                activeTab === 'lista'
                  ? 'bg-wood-600 text-white border-b-4 border-wood-800'
                  : 'text-wood-700 hover:bg-wood-100'
              }`}
            >
              <ClipboardDocumentListIcon className="w-5 h-5" />
              <span>Lista Spesa</span>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-4">
        <div className="slide-in">
          {activeTab === 'bacheca' && <BachecaFamiglia />}
          {activeTab === 'lista' && <ListaSpesa />}
        </div>
      </main>

      {/* Notification Button */}
      <button className="fixed bottom-6 right-6 bg-wood-600 hover:bg-wood-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110">
        <BellIcon className="w-6 h-6" />
        {notificationCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            {notificationCount}
          </span>
        )}
      </button>
    </div>
  )
}
