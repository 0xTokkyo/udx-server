/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   seed.ts                                              / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-07 00:36:03 by 0xTokkyo                                    */
/*   Updated: 2025-10-07 20:47:01 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import { db } from './index.js'
import { users, organizations, roles, ships, discovery, server } from './schema.js'
import { eq } from 'drizzle-orm'
import { nanoid, customAlphabet } from 'nanoid'
import { logInfo, logError } from '@/utils/'

const random_key = customAlphabet('23456789ABCDEFGHJKMNPQRSTUVWXYZ')

/**
 * Seed the database with initial data for development and testing.
 */
async function seed() {
  try {
    logInfo('Seeding UDX database...')

    const serverEntry = await db.insert(server).values({}).returning()
    logInfo('Server entry created:', serverEntry[0])

    process.exit(0)
  } catch (error) {
    logError('Seed failed:', error)
    process.exit(1)
  }
}
seed()
