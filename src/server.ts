/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   server.ts                                            / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-07 12:50:27 by 0xTokkyo                                    */
/*   Updated: 2025-10-07 19:46:45 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import express from 'express'
import http from 'http'
import cors from 'cors'
import helmet from 'helmet'
import dotenvx from '@dotenvx/dotenvx'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import { rateLimit } from 'express-rate-limit'
import {
  is,
  logger,
  helmetOptions,
  corsOptions,
  limiterOptions as rateLimitOptions,
  logError,
  logInfo
} from '@/utils/'
import { UDXMiddleware } from '@/middleware/'
import { apiRoutes } from '@/routes/'
import { initializeWebSocket } from '@/services'

/**
 * @file src/server.ts
 * @fileoverview Main server file to start the application.
 */

dotenvx.config({
  path: is.dev ? './env/.env' : './env/.env.production'
})
const app = express()
const port = process.env.SERVER_PORT || 3004

/**
 * Create HTTP server
 */
const server = http.createServer(app)

/**
 * Morgan Logger
 */
if (is.dev) {
  app.use(morgan('dev'))
} else {
  app.use(
    morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim())
      }
    })
  )
}

/**
 * App Use Middlewares
 */
app.use(express.json())
app.use(cookieParser())
app.use(helmet(helmetOptions))
app.use(cors(corsOptions))
app.use(rateLimit(rateLimitOptions))
app.use(UDXMiddleware)
app.use('/s/public', express.static('storage/public'))

/**
 * Routes
 */
app.use('/api', apiRoutes)

/**
 * Init WebSocket
 */
initializeWebSocket(server)

/**
 * Start HTTP Server
 */
server.listen(port, () => {
  logInfo(`UDX server running on port ${port} with worker PID: ${process.pid}`)
})

/**
 * Error Handling
 */
const gracefulShutdown = (signal: string) => {
  logInfo(`\n${signal} signal received: closing UDX HTTP server`)

  server.close(() => {
    logInfo('UDX HTTP server closed')
    process.exit(0)
  })

  setTimeout(() => {
    logError('Could not close connections in time, forcefully shutting down')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logError('Unhandled Rejection at:', promise, { reason })
})

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error: Error) => {
  logError('Uncaught Exception:', error)
  process.exit(1)
})

export default app
