'use client'

import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

interface PostIt {
  id: string
  message: string
  author: string
  color: string
  timestamp: Date
}

const colors = [
  'bg-yellow-300',
  'bg-pink-300', 
  'bg-blue-300',
  'bg-green-300',
  'bg-orange-300',
  'bg-purple-300'
]

const familyMembers = [
  'Matteo', 'Bea', 'Giuseppe', 'Michela'
]

export default function BachecaFamiglia() {
  const [postits, setPostits] = useState<PostIt[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState(familyMembers[0])
  const [showForm, setShowForm] = useState(false)

  // Carica i post-it salvati
  useEffect(() => {
    const saved = localStorage.getItem('famiglia-bacheca')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setPostits(parsed.map((p: any) => ({
          ...p,
          timestamp: new Date(p.timestamp)
        })))
      } catch (error) {
        console.error('Errore nel caricamento dei post-it:', error)
      }
    }
  }, [])

  // Salva i post-it
  useEffect(() => {
    localStorage.setItem('famiglia-bacheca', JSON.stringify(postits))
  }, [postits])

  const addPostIt = () => {
    if (!newMessage.trim()) return

    const newPostIt: PostIt = {
      id: Date.now().toString(),
      message: newMessage,
      author: selectedAuthor,
      color: colors[Math.floor(Math.random() * colors.length)],
      timestamp: new Date()
    }

    setPostits([...postits, newPostIt])
    setNewMessage('')
    setShowForm(false)

    // Simula notifica agli altri membri
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`Nuovo messaggio da ${selectedAuthor}`, {
        body: newMessage.substring(0, 50) + (newMessage.length > 50 ? '...' : ''),
        icon: '/icon-192x192.png'
      })
    }
  }

  const deletePostIt = (id: string) => {
    setPostits(postits.filter(p => p.id !== id))
  }

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) return 'Proprio ora'
    if (hours < 24) return `${hours}h fa`
    return timestamp.toLocaleDateString('it-IT')
  }

  return (
    <div className="space-y-6">
      {/* Pannello di legno */}
      <div className="bg-gradient-to-br from-yellow-700 to-amber-800 relative min-h-[600px] rounded-lg p-8 shadow-2xl border-4 border-amber-900">
        <div className="absolute top-4 left-4 right-4">
          <h2 className="text-2xl font-bold text-white text-center drop-shadow-lg">
            📌 Bacheca di Famiglia
          </h2>
        </div>

        {/* Post-its */}
        <div className="pt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {postits.map((postit, index) => (
            <div
              key={postit.id}
              className={`${postit.color} p-4 rounded-lg shadow-lg relative group max-w-64 transform transition-all duration-300 hover:scale-105 hover:rotate-0`}
              style={{
                transform: `rotate(${(index % 3 - 1) * 3}deg)`,
                marginTop: index % 2 === 0 ? '0' : '20px'
              }}
            >
              {/* Puntina */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-600 rounded-full shadow-md border-2 border-red-800"></div>
              
              {/* Contenuto */}
              <div className="text-gray-800">
                <p className="text-sm mb-3 leading-relaxed break-words font-medium">
                  {postit.message}
                </p>
                
                <div className="text-xs text-gray-600 border-t border-gray-400 pt-2">
                  <p className="font-semibold">{postit.author}</p>
                  <p>{formatTime(postit.timestamp)}</p>
                </div>
              </div>

              {/* Pulsante elimina */}
              <button
                onClick={() => deletePostIt(postit.id)}
                className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Post-it vuoto per aggiungere */}
        <div className="fixed bottom-20 right-6 lg:absolute lg:bottom-8 lg:right-8">
          <button
            onClick={() => setShowForm(true)}
            className="bg-yellow-300 hover:bg-yellow-400 p-6 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 transform rotate-2 hover:rotate-0"
          >
            <PlusIcon className="w-8 h-8 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Form per nuovo post-it */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">✍️ Nuovo Messaggio</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chi sei?
                </label>
                <select
                  value={selectedAuthor}
                  onChange={(e) => setSelectedAuthor(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  {familyMembers.map(member => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Messaggio
                </label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Scrivi il tuo messaggio..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  rows={4}
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {newMessage.length}/200 caratteri
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={addPostIt}
                  disabled={!newMessage.trim()}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  📌 Attacca
                </button>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setNewMessage('')
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}