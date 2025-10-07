/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   websocket.ts                                         / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-07 13:58:39 by 0xTokkyo                                    */
/*   Updated: 2025-10-07 15:28:26 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import { Server as SocketIOServer } from 'socket.io'
import type { Server as HTTPServer } from 'http'
import type { Socket } from 'socket.io'
import type { UserJwtPayload, WSMessage, WSUserStatus } from '@/types/'
import { corsOptions, logger } from '@/utils/'
import jwt from 'jsonwebtoken'

/**
 * @file src/services/websocket.ts
 * @fileoverview WebSocket service using Socket.IO for real-time communication in UDX.
 */

// CONSTANTS
const ORG_CONNECTIONS: Map<string, Set<string>> = new Map()
const USER_CONNECTIONS: Map<string, string> = new Map()
const SOCKET_USERS: Map<string, UserJwtPayload> = new Map()

let io: SocketIOServer | null = null

/**
 * Interface for extended authenticated user data
 */
interface AuthenticatedSocket extends Socket {
  user?: UserJwtPayload
}

/**
 * Authenticate a user via their JWT token
 */
const authenticateUser = (token: string): UserJwtPayload => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined')
  }

  const userDecodedJwt = jwt.verify(token, process.env.JWT_SECRET) as UserJwtPayload

  if (!userDecodedJwt || !userDecodedJwt.user_id) {
    throw new Error('Invalid JWT payload')
  }

  return userDecodedJwt
}

/**
 * Add a user to an org room
 */
const joinOrgRoom = (socket: AuthenticatedSocket, org_id: string) => {
  const roomName = `org:${org_id}`

  socket.join(roomName)

  if (ORG_CONNECTIONS.has(org_id)) {
    ORG_CONNECTIONS.get(org_id)?.add(socket.id)
  } else {
    ORG_CONNECTIONS.set(org_id, new Set([socket.id]))
  }

  logger.info(`User ${socket.user?.user_id} joined org room: ${roomName}`)
}

/**
 * Remove a user from an org room
 */
const leaveOrgRoom = (socket: AuthenticatedSocket, org_id: string) => {
  const roomName = `org:${org_id}`

  // Leave the room
  socket.leave(roomName)

  // Remove from our tracking
  const orgConnections = ORG_CONNECTIONS.get(org_id)
  if (orgConnections) {
    orgConnections.delete(socket.id)

    // If no one left in the org, delete the room
    if (orgConnections.size === 0) {
      ORG_CONNECTIONS.delete(org_id)
      logger.info(`Org room ${roomName} deleted - no more connections`)
    }
  }

  logger.info(`User ${socket.user?.user_id} left org room: ${roomName}`)
}

/**
 * Clean up socket connections on disconnection
 */
const cleanupSocket = (socket: AuthenticatedSocket) => {
  if (socket.user?.user_id) {
    USER_CONNECTIONS.delete(socket.user?.user_id)
  }

  SOCKET_USERS.delete(socket.id)

  if (socket.user?.org_id) {
    leaveOrgRoom(socket, socket.user?.org_id)
  }
}

/**
 * Init WebSocket Server
 * @param {HTTPServer} server - The UDX HTTP server to attach the WebSocket server to.
 * @returns {SocketIOServer} The now initialized Socket.IO server instance.
 */
export const initializeWebSocket = (server: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: { ...corsOptions },
    transports: ['websocket', 'polling']
  })

  /**
   * Automatic Authentication Middleware
   * @param {Socket} socket - The socket connection to authenticate.
   * @param {Function} next - The next middleware function.
   * @throws {Error} If authentication fails.
   */
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.replace('Bearer ', '')

      if (!token) {
        throw new Error('No authentication token provided')
      }

      const userData = authenticateUser(token)

      /**
       * Extend socket with user data
       */
      const authSocket = socket as AuthenticatedSocket
      authSocket.user = userData

      /**
       * Add user to tracking maps
       */
      USER_CONNECTIONS.set(userData.user_id, socket.id)
      SOCKET_USERS.set(socket.id, userData)

      next()
    } catch (error) {
      const errMsg = `WebSocket authentication failed: ${error instanceof Error ? error.message : String(error)}`
      logger.error(errMsg)
      next(new Error('Authentication failed'))
    }
  })

  /**
   * Handle client connections
   */
  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`User ${socket.user?.user_id} connected to WebSocket`)

    // Automatically join org room if user is part of an organization
    if (socket.user?.org_id) {
      joinOrgRoom(socket, socket.user.org_id)
    }

    // Send authenticated connection confirmation
    socket.emit('authenticated', {
      message: 'authentication-successful',
      user_id: socket.user?.user_id
    })

    /**
     * Send a message to all org members
     */
    socket.on('org:message', (data: { message: string; type?: string }) => {
      if (!socket.user?.org_id) {
        socket.emit('error', { message: 'User not in any organization' })
        return
      }

      const payload: WSMessage = {
        type: data.type || 'message',
        room: `org:${socket.user.org_id}`,
        event: 'org:message',
        data: {
          message: data.message,
          sender: {
            user_id: socket.user.user_id
          },
          timestamp: new Date().toISOString()
        }
      }

      // Send to all org members (except sender)
      socket.to(`org:${socket.user.org_id}`).emit('org:message', payload)

      logger.info(`Message sent in org ${socket.user.org_id} by user ${socket.user.user_id}`)
    })

    /**
     * Notify user status (online/offline)
     */
    socket.on('user:status', (status: { logged_in: boolean }) => {
      if (!socket.user?.org_id) return

      const userStatus: WSUserStatus = {
        user_id: socket.user.user_id,
        logged_in: status.logged_in
      }

      // Notify org of status change
      socket.to(`org:${socket.user.org_id}`).emit('user:status', userStatus)

      logger.info(
        `User ${socket.user.user_id} status updated: ${status.logged_in ? 'online' : 'offline'}`
      )
    })

    /**
     * Get the list of connected users in the org
     */
    socket.on('org:get-online-users', () => {
      if (!socket.user?.org_id) {
        socket.emit('error', { message: 'User not in any organization' })
        return
      }

      const orgConnections = ORG_CONNECTIONS.get(socket.user.org_id)
      if (!orgConnections) {
        socket.emit('org:online-users', { users: [] })
        return
      }

      const onlineUsers = Array.from(orgConnections)
        .map((socketId) => SOCKET_USERS.get(socketId))
        .filter(Boolean)
        .map((userData) => ({
          user_id: userData!.user_id
        }))

      socket.emit('org:online-users', { users: onlineUsers })
    })

    socket.on('error', (error: Error | unknown) => {
      const errMsg = `WebSocket error for user ${socket.user?.user_id}: ${error instanceof Error ? error.message : String(error)}`
      logger.error(errMsg)
    })

    socket.on('disconnect', (reason: string) => {
      logger.info(`User ${socket.user?.user_id} disconnected: ${reason}`)

      // Notify org that user has disconnected
      if (socket.user?.org_id) {
        const userStatus: WSUserStatus = {
          user_id: socket.user.user_id,
          logged_in: false
        }
        socket.to(`org:${socket.user.org_id}`).emit('user:status', userStatus)
      }

      // Clean up connections
      cleanupSocket(socket)
    })
  })

  logger.info('UDX WebSocket server initialized')
  return io
}

/**
 * Get the Socket.IO instance
 */
export const getSocketIOInstance = (): SocketIOServer | null => {
  return io
}

/**
 * Send a message to all users in an org
 */
export const sendToOrg = (org_id: string, event: string, data: unknown) => {
  if (!io) return

  //! INSECURE - Ensure data is typesafe and sanitized before sending
  // TODO - Validate event and data structure
  io.to(`org:${org_id}`).emit(event, data)
  logger.info(`Message sent to org ${org_id}: ${event}`)
}

/**
 * Send a message to a specific user
 */
export const sendToUser = (user_id: string, event: string, data: unknown) => {
  if (!io) return

  //! INSECURE - Ensure data is typesafe and sanitized before sending
  // TODO - Validate event and data structure
  const socketId = USER_CONNECTIONS.get(user_id)
  if (socketId) {
    io.to(socketId).emit(event, data)
    logger.info(`Message sent to user ${user_id}: ${event}`)
  }
}

/**
 * Get connection statistics
 */
export const getConnectionStats = () => {
  return {
    totalConnections: SOCKET_USERS.size,
    orgRooms: ORG_CONNECTIONS.size,
    orgConnections: Object.fromEntries(
      Array.from(ORG_CONNECTIONS.entries()).map(([org_id, connections]) => [org_id, connections.size])
    )
  }
}
