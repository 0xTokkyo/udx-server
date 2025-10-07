/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   index.ts                                             / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-07 15:30:05 by 0xTokkyo                                    */
/*   Updated: 2025-10-07 15:32:07 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

/**
 * @file src/types/index.ts
 * @fileoverview Type definitions for UDX.
 */

export interface UserJwtPayload {
  user_id: string
  org_id: string | null
  iat?: number
  exp?: number
}

export interface WSMessage {
  type: string
  room: string
  event: string
  data: unknown
}

export interface WSUserStatus {
  user_id: string
  logged_in: boolean
}
