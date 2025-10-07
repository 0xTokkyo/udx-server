/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   UDXMiddleware.ts                                     / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-07 13:16:15 by 0xTokkyo                                    */
/*   Updated: 2025-10-07 13:33:20 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import type { Request, Response, NextFunction } from 'express'

/**
 * @file src/middleware/UDXMiddleware.ts
 * @fileoverview Middleware to handle UDX requests.
 */

export const UDXMiddleware = (req: Request, res: Response, next: NextFunction) => {
  /**
   * We need let auth and api routes pass through
   * without any checks.
   */
  if (req.path.startsWith('/auth/') || req.path.startsWith('/api/')) {
    return next()
  }

  /**
   * Check if UDX_SECRET match the request header X-UDX-SECRET
   */
  const UDX_SECRET = process.env.UDX_SECRET

  // If UDX_SECRET is not set, completely stop the process and server
  if (!UDX_SECRET || UDX_SECRET === '') {
    console.error('UDX_SECRET is not set. Please set it in the environment variables.')
    process.exit(1)
  }

  /**
   * If the secret matches, proceed to the next middleware or route handler.
   * If it doesn't match, respond with a 403 Forbidden status. Simple.
   */
  if (req.header('X-UDX-SECRET') === UDX_SECRET) {
    next()
    return
  }

  res.status(403).json({
    success: false,
    error: 'access-denied',
    message: 'Invalid Electron secret'
  })
}
