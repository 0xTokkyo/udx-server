/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   index.ts                                             / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-07 10:50:36 by 0xTokkyo                                    */
/*   Updated: 2025-10-07 19:12:26 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'
import path from 'path'
import { fileURLToPath } from 'url'

/**
 * @file src/db/index.ts
 * @description Initializes and exports the database connection using Drizzle ORM with Better SQLite3.
 */

// CONSTANTS
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DB_PATH = path.resolve(__dirname, `../../data/${process.env.DB_FILE_NAME || 'udx'}.db`)

/**
 * Initialize Better SQLite3 database connection
 */
const sqlite = new Database(DB_PATH)

/**
 * Enable WAL mode for better concurrency
 * @see {@link https://www.sqlite.org/wal.html}
 */
sqlite.pragma('journal_mode = WAL')

/**
 * Create Drizzle ORM instance
 */
export const db = drizzle(sqlite, { schema })

/**
 * Export schema for migrations and type safety
 */
export { schema }
export type * from './schema'
