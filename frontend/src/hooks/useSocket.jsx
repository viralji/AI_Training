import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './useAuth'
import { getSocketUrl } from '../utils/config'

export const useSocket = (eventHandlers = {}) => {
  const socketRef = useRef(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    // Create socket connection
    socketRef.current = io(getSocketUrl(), {
      transports: ['websocket'],
      autoConnect: true
    })

    const socket = socketRef.current

    // Join training room
    socket.emit('join-training')

    // Set up event handlers
    Object.keys(eventHandlers).forEach(event => {
      socket.on(event, eventHandlers[event])
    })

    return () => {
      socket.off('*') // Remove all listeners
      socket.emit('leave-training')
      socket.disconnect()
    }
  }, [user, eventHandlers])

  return socketRef.current
}

