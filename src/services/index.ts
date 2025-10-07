/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   index.ts                                             / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-07 13:58:17 by 0xTokkyo                                    */
/*   Updated: 2025-10-07 15:33:22 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

/**
 * @file src/services/index.ts
 * @fileoverview Exports all services for easy import.
 */

export {
  initializeWebSocket,
  sendToOrg,
  sendToUser,
  getConnectionStats,
  getSocketIOInstance
} from './websocket'
