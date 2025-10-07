/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   drizzle.config.ts                                    / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-07 10:51:47 by 0xTokkyo                                    */
/*   Updated: 2025-10-07 12:08:02 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import type { Config } from 'drizzle-kit'

export default {
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: `./data/${process.env.DB_FILE_NAME || 'udx'}.db`
  }
} satisfies Config
