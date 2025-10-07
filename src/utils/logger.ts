/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   logger.ts                                            / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-07 11:11:10 by 0xTokkyo                                    */
/*   Updated: 2025-10-07 19:14:35 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import DailyRotateFile from 'winston-daily-rotate-file'
import winston from 'winston'
import { is } from '@/utils/'
import path from 'path'
import { fileURLToPath } from 'url'

/**
 * @file src/utils/logger.ts
 * @fileoverview Logger utility using Winston with daily rotation.
 */

// CONSTANTS
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const LOGS_DIR = path.resolve(__dirname, '../../logs')

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
)

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      udx: '\x1b[38;5;208m',
      udxBg: '\x1b[48;5;208m',
      green: '\x1b[32m',
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      cyan: '\x1b[36m',
      muted: '\x1b[90m'
    }
    
    const prefix = `${colors.udx}${colors.bright}UDX ${colors.udxBg} SERVER ${colors.reset}`
    
    let levelColor = colors.cyan
    if (level === 'error') levelColor = colors.red
    else if (level === 'warn') levelColor = colors.yellow
    else if (level === 'info') levelColor = colors.cyan
    
    let msg = `${prefix} ${colors.muted}${timestamp}${colors.reset} ${levelColor}${message}${colors.reset}`
    
    if (Object.keys(meta).length > 0) {
      msg += ` ${colors.muted}${JSON.stringify(meta)}${colors.reset}`
    }
    return msg
  })
)

const errorTransport = new DailyRotateFile({
  filename: path.join(LOGS_DIR, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat
})

const combinedTransport = new DailyRotateFile({
  filename: path.join(LOGS_DIR, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat
})

const consoleTransport = new winston.transports.Console({
  format: consoleFormat // Toujours utiliser le format lisible en console
})

export const logger = winston.createLogger({
  level: is.dev ? 'debug' : 'info',
  format: logFormat,
  transports: [errorTransport, combinedTransport, consoleTransport],
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(LOGS_DIR, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    })
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(LOGS_DIR, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
})

export const logInfo = (message: string, meta?: object): void => {
  logger.info(message, meta)
}

export const logError = (message: string, error?: Error | unknown, meta?: object): void => {
  if (error instanceof Error) {
    logger.error(message, { error: error.message, stack: error.stack, ...meta })
  } else {
    logger.error(message, { error, ...meta })
  }
}

export const logWarn = (message: string, meta?: object): void => {
  logger.warn(message, meta)
}

export const logDebug = (message: string, meta?: object): void => {
  logger.debug(message, meta)
}
