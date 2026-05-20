import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'

let socket: Socket | null = null

function getSocket(token?: string): Socket {
  if (!socket || !socket.connected) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      auth: token ? { token } : undefined,
    })
  }
  return socket
}

export function connectToOrderUpdates(
  orderId: string,
  callback: (data: { status: string; orderRef: string }) => void,
  token?: string
): Socket {
  const s = getSocket(token)
  s.emit('join-order', orderId)
  s.on('order-update', (data) => {
    if (data.orderRef === orderId || data.orderId === orderId) {
      callback(data)
    }
  })
  return s
}

export function disconnectFromOrderUpdates(orderId: string): void {
  if (socket?.connected) {
    socket.emit('leave-order', orderId)
    socket.off('order-update')
  }
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
