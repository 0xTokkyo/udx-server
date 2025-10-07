/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   options.ts                                           / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-07 13:21:56 by 0xTokkyo                                    */
/*   Updated: 2025-10-07 13:30:41 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

/**
 * @file src/utils/options.ts
 * @fileoverview Configuration options for server middlewares.
 */

/**
 * Helmet Security Middleware Options
 */
export const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'", '*'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", 'data:']
    }
  },
  crossOriginEmbedderPolicy: true
}

/**
 * CORS Middleware Options
 */
export const corsOptions = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Cookie',
    'X-UDX-Secret',
    'X-UDX-Requested-ID'
  ]
}

/**
 * Rate Limiter Middleware Options
 */
export const limiterOptions = {
  windowMs: 4 * 60 * 1000,
  max: 150,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
}
