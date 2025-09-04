'use client'

import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface PostIt {
  id: string
  message: string
  author: string
  color: string
  created_at: string
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
  const [loading, setLoading] = useState(true)

  // Carica i post-it da Supabase
  useEffect(() => {
    loadPostits()
    
    // Subscription per real-time updates
    const subscription = supabase
      .channel('postits')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'postits' }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPostits(prev => [payload.new as PostIt, ...prev])
          } else if (payload.eventType === 'DELETE') {
            setPostits(prev => prev.filter(p => p.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadPostits = async () => {
    try {
      const { data, error } = await supabase
        .from('postits')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Errore nel caricamento post-it:', error)
        return
      }

      setPostits(data || [])
    } catch (error) {
      console.error('Errore nel caricamento post-it:', error)
    } finally {
      setLoading(false)
    }
  }

  const addPostIt = async () => {
    if (!newMessage.trim()) return

    const newPostIt = {
      id: Date.now().toString(),
      message: newMessage,
      author: selectedAuthor,
      color: colors[Math.floor(Math.random() * colors.length)]
    }

    try {
      const { error } = await supabase
        .from('postits')
        .insert([newPostIt])

      if (error) {
        console.error('Errore nell\'aggiunta post-it:', error)
        return
      }

      setNewMessage('')
      setShowForm(false)

      // Notifica locale
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`Nuovo messaggio da ${selectedAuthor}`, {
          body: newMessage.substring(0, 50) + (newMessage.length > 50 ? '...' : ''),
          icon: '/icon-192x192.png'
        })
      }
    } catch (error) {
      console.error('Errore nell\'aggiunta post-it:', error)
    }
  }

  const deletePostIt = async (id: string) => {
    try {
      const { error } = await supabase
        .from('postits')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Errore nell\'eliminazione post-it:', error)
        return
      }
    } catch (error) {
      console.error('Errore nell\'eliminazione post-it:', error)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) return 'Proprio ora'
    if (hours < 24) return `${hours}h fa`
    return date.toLocaleDateString('it-IT')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento bacheca...</p>
        </div>
      </div>
    )
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
                  <p>{formatTime(postit.created_at)}</p>
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

        {/* Messaggio vuoto */}
        {postits.length === 0 && (
          <div className="pt-16 flex items-center justify-center h-64">
            <p className="text-white text-xl font-handwriting">
              Ancora nessun messaggio. Aggiungi il primo! 📝
            </p>
          </div>
        )}

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