'use client'

import { CheckIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface ShoppingItem {
  id: number
  text: string
  added_by: string
  created_at: string
  completed: boolean
}

const familyMembers = [
  'Matteo', 'Bea', 'Giuseppe', 'Michela'
]

export default function ListaSpesa() {
  const [items, setItems] = useState<ShoppingItem[]>(
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      text: '',
      added_by: '',
      created_at: new Date().toISOString(),
      completed: false
    }))
  )
  const [selectedMember, setSelectedMember] = useState(familyMembers[0])
  const [loading, setLoading] = useState(true)

  // Carica la lista da Supabase
  useEffect(() => {
    loadShoppingItems()
    
    // Subscription per real-time updates
    const subscription = supabase
      .channel('shopping_items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_items' }, 
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newItem = payload.new as ShoppingItem
            setItems(prev => {
              const newItems = [...prev]
              newItems[newItem.id] = newItem
              return newItems
            })
          } else if (payload.eventType === 'DELETE') {
            const deletedItem = payload.old as { id: number }
            setItems(prev => {
              const newItems = [...prev]
              newItems[deletedItem.id] = {
                id: deletedItem.id,
                text: '',
                added_by: '',
                created_at: new Date().toISOString(),
                completed: false
              }
              return newItems
            })
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadShoppingItems = async () => {
    try {
      const { data, error } = await supabase
        .from('shopping_items')
        .select('*')
        .order('id')

      if (error) {
        console.error('Errore nel caricamento lista spesa:', error)
        return
      }

      // Crea array con 20 elementi
      const newItems = Array.from({ length: 20 }, (_, i) => {
        const dbItem = data?.find(row => row.id === i)
        return {
          id: i,
          text: dbItem?.text || '',
          added_by: dbItem?.added_by || '',
          created_at: dbItem?.created_at || new Date().toISOString(),
          completed: dbItem?.completed || false
        }
      })

      setItems(newItems)
    } catch (error) {
      console.error('Errore nel caricamento lista spesa:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateItem = async (id: number, text: string) => {
    try {
      if (text.trim()) {
        // Inserisci o aggiorna elemento
        const { error } = await supabase
          .from('shopping_items')
          .upsert({
            id,
            text: text.trim(),
            added_by: selectedMember,
            completed: false
          })

        if (error) {
          console.error('Errore nell\'aggiornamento elemento:', error)
          return
        }

        // Notifica locale
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(`${selectedMember} ha aggiunto alla lista`, {
            body: text.trim(),
            icon: '/icon-192x192.png'
          })
        }
      } else {
        // Rimuovi elemento vuoto
        await clearItem(id)
      }
    } catch (error) {
      console.error('Errore nell\'aggiornamento elemento:', error)
    }
  }

  const clearItem = async (id: number) => {
    const item = items[id]
    if (!item?.text) return

    try {
      const { error } = await supabase
        .from('shopping_items')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Errore nella cancellazione elemento:', error)
        return
      }

      // Notifica cancellazione
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`${selectedMember} ha rimosso dalla lista`, {
          body: item.text,
          icon: '/icon-192x192.png'
        })
      }
    } catch (error) {
      console.error('Errore nella cancellazione elemento:', error)
    }
  }

  const toggleComplete = async (id: number) => {
    const item = items[id]
    if (!item?.text) return

    try {
      const { error } = await supabase
        .from('shopping_items')
        .update({ completed: !item.completed })
        .eq('id', id)

      if (error) {
        console.error('Errore nel toggle completamento:', error)
        return
      }
    } catch (error) {
      console.error('Errore nel toggle completamento:', error)
    }
  }

  const clearAll = async () => {
    if (typeof window !== 'undefined' && !window.confirm('🗑️ Sei sicuro di voler cancellare tutta la lista?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('shopping_items')
        .delete()
        .neq('id', -1) // Elimina tutti

      if (error) {
        console.error('Errore nello svuotamento lista:', error)
        return
      }

      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`${selectedMember} ha svuotato la lista della spesa`, {
          icon: '/icon-192x192.png'
        })
      }
    } catch (error) {
      console.error('Errore nello svuotamento lista:', error)
    }
  }

  const activeItems = items.filter(item => item.text.trim())
  const completedCount = activeItems.filter(item => item.completed).length

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (minutes < 1) return 'ora'
    if (minutes < 60) return `${minutes}m fa`
    if (hours < 24) return `${hours}h fa`
    return date.toLocaleDateString('it-IT')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento lista spesa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con statistiche */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">🛒 Lista della Spesa</h2>
            <p className="text-gray-600">
              {activeItems.length} elementi • {completedCount} completati
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {familyMembers.map(member => (
                <option key={member} value={member}>👤 {member}</option>
              ))}
            </select>
            
            <button
              onClick={clearAll}
              disabled={activeItems.length === 0}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <TrashIcon className="w-5 h-5" />
              <span>Cancella tutto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista degli elementi */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {items.map((item, index) => (
            <div key={item.id} className={`p-4 flex items-center space-x-4 bg-white border-l-4 transition-all duration-300 hover:bg-gray-50 ${
              item.completed ? 'border-l-gray-400 bg-gray-50 opacity-70' : 'border-l-green-500'
            } ${item.text ? 'hover:border-l-blue-500 hover:translate-x-1' : ''}`}>
              {/* Numero riga */}
              <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>

              {/* Checkbox */}
              <button
                onClick={() => toggleComplete(item.id)}
                disabled={!item.text}
                className={`flex-shrink-0 w-6 h-6 rounded border-2 transition-colors duration-200 flex items-center justify-center ${
                  item.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-green-500'
                } ${!item.text ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {item.completed && <CheckIcon className="w-4 h-4" />}
              </button>

              {/* Input */}
              <div className="flex-1">
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => updateItem(item.id, e.target.value)}
                  onBlur={(e) => updateItem(item.id, e.target.value)}
                  placeholder={`Elemento ${index + 1}...`}
                  className={`w-full p-2 border-0 bg-transparent focus:outline-none text-lg ${
                    item.completed ? 'line-through text-gray-500' : 'text-gray-800'
                  }`}
                  maxLength={100}
                />
                {item.added_by && (
                  <p className="text-xs text-gray-500 mt-1">
                    Aggiunto da {item.added_by} • {formatTime(item.created_at)}
                  </p>
                )}
              </div>

              {/* Pulsante cancella */}
              <button
                onClick={() => clearItem(item.id)}
                disabled={!item.text}
                className="flex-shrink-0 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Suggerimenti rapidi */}
      <div className="bg-green-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-green-800 mb-3">💡 Suggerimenti rapidi</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {['Pane', 'Latte', 'Uova', 'Pasta', 'Pomodori', 'Formaggio', 'Carne', 'Frutta'].map(suggestion => (
            <button
              key={suggestion}
              onClick={() => {
                const emptySlot = items.find(item => !item.text)
                if (emptySlot) {
                  updateItem(emptySlot.id, suggestion)
                }
              }}
              className="px-3 py-2 bg-white hover:bg-green-100 text-green-700 rounded-lg text-sm transition-colors duration-200 border border-green-200"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Pulsante geolocalizzazione (per demo) */}
      <div className="fixed bottom-20 left-6 lg:absolute lg:bottom-8 lg:left-8">
        <button
          onClick={() => {
            if (typeof window !== 'undefined' && navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  // Simula notifica supermercato vicino
                  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && activeItems.length > 0) {
                    new Notification('🏪 Supermercato nelle vicinanze!', {
                      body: `Hai ${activeItems.length} elementi nella lista`,
                      icon: '/icon-192x192.png'
                    })
                  }
                },
                () => console.log('Geolocalizzazione negata')
              )
            }
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
        >
          📍
        </button>
      </div>
    </div>
  )
}