/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   api.routes.ts                                        / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-07 13:35:32 by 0xTokkyo                                    */
/*   Updated: 2025-10-07 20:01:53 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import { Router } from 'express'
import { db } from '@/db'
import { server } from '@/db/schema'
import { is } from '@/utils'

/**
 * @file src/routes/api.routes.ts
 * @fileoverview API routes for UDX.
 */

const router = Router()

/**
 * @property {GET} /health Check server health
 * @description Simple health check endpoint to verify if the server is running.
 * @returns {Object} 200 - Server is healthy
 * @returns {Object} 500 - Server is unhealthy
 */
router.get('/health', (req, res) => {
  try {
    return res.status(200).json({ success: true, status: 'healthy', message: 'server-is-healthy' })
  } catch (error: Error | unknown) {
    return res.status(500).json({ success: false, status: 'error', message: 'server-is-unhealthy' })
  }
})

/**
 * @property {GET} /database-health Check database health
 * @description Perform a simple request to db, checks the health of the database connection.
 * @returns {Object} 200 - Server is healthy
 * @returns {Object} 500 - Server is unhealthy
 */
router.get('/database-health', async (req, res) => {
  try {
    const response = await db.select().from(server).limit(1)
    if (response && response.length >= 0 && response[0]?.active === true) {
      is.dev ? console.log(response) : null
      return res.status(200).json({ success: true, status: 'healthy', message: 'database-is-healthy' })
    }
    throw new Error('Database health check failed')
  } catch (error: Error | unknown) {
    return res.status(500).json({ success: false, status: 'error', message: 'database-is-unhealthy' })
  }
})

export default router
