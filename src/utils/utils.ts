/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   utils.ts                                             / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-07 12:51:57 by 0xTokkyo                                    */
/*   Updated: 2025-10-07 15:39:32 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

/**
 * @file src/utils/utils.ts
 * @fileoverview Utility functions and constants for UDX.
 */

export const is = {
  dev: process.env.MODE === 'development',
  prod: process.env.MODE === 'production',
}