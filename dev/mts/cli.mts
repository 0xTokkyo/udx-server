#!/usr/bin/env node
/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   cli.mts                                              / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-07 15:48:08 by 0xTokkyo                                    */
/*   Updated: 2025-10-07 19:08:24 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import inquirer from 'inquirer'
import { spawn } from 'child_process'
import { colors } from './u.mts'

/**
 * @file dev/mts/cli.mts
 * @fileoverview CLI for UDX-SERVER.
 */

interface MenuChoice {
  name: string
  value: string
  description: string
}

const CURSOR = `${colors.udx}${colors.bright}➤${colors.reset}`

function formatActionName(action: string, description: string, maxLength: number = 12): string {
  const actionPart = `${colors.udx}${colors.bright}${action}${colors.reset}`
  const padding = ' '.repeat(Math.max(0, maxLength - action.length))
  return `${actionPart}${padding} - ${description}`
}

function clearConsole(): void {
  process.stdout.write('\x1b[2J\x1b[0f')
}

const actions: MenuChoice[] = [
  {
    name: formatActionName('SYNC-ENVX', 'Sync environment variables for DotenvX'),
    value: 'sync-envx',
    description: `\n${colors.muted}Sync the environment variables for DotenvX${colors.reset}\n`
  },
  {
    name: formatActionName('DEV', 'Start server in development mode'),
    value: 'dev',
    description: `\n${colors.muted}Start the server with hot reloading and development features${colors.reset}\n`
  },
  {
    name: formatActionName('BUILD', 'Build the server'),
    value: 'build',
    description: `\n${colors.muted}Compile the TypeScript project for production${colors.reset}\n`
  },
  {
    name: formatActionName('START', 'Start the server in production mode'),
    value: 'start',
    description: `\n${colors.muted}Start the compiled server in production mode${colors.reset}\n`
  },
  {
    name: formatActionName('TEST', 'Run tests'),
    value: 'test',
    description: `\n${colors.muted}Run the test suite${colors.reset}\n`
  },
  {
    name: formatActionName(
      'DATABASE',
      `Database management ${colors.udx}${colors.bright}→${colors.reset}`
    ),
    value: 'database',
    description: `\n${colors.muted}Manage database migrations, seeding, and more${colors.reset}\n`
  },
  {
    name: formatActionName(
      'PM2',
      `Manage PM2 processes ${colors.udx}${colors.bright}→${colors.reset}`
    ),
    value: 'pm2',
    description: `\n${colors.muted}Manage the application with PM2 process manager${colors.reset}\n`
  },
  {
    name: `${colors.muted}QUIT${colors.reset}\n`,
    value: 'exit',
    description: `\n${colors.muted}Close the CLI${colors.reset}\n`
  }
]

const dbActions: MenuChoice[] = [
  {
    name: formatActionName('INIT', 'Initialize the database'),
    value: 'db:init',
    description: `\n${colors.muted}Initialize the database${colors.reset}\n`
  },
  {
    name: formatActionName('GENERATE', 'Generate a new migration'),
    value: 'db:generate',
    description: `\n${colors.muted}Generate a new database migration${colors.reset}\n`
  },
  {
    name: formatActionName('MIGRATE', 'Run database migrations'),
    value: 'db:migrate',
    description: `\n${colors.muted}Run pending database migrations${colors.reset}\n`
  },
  {
    name: formatActionName('ROLLBACK', 'Rollback the last migration'),
    value: 'db:rollback',
    description: `\n${colors.muted}Rollback the last database migration${colors.reset}\n`
  },
  {
    name: formatActionName('PUSH', 'Push the database schema'),
    value: 'db:push',
    description: `\n${colors.muted}Push the database schema changes${colors.reset}\n`
  },
  {
    name: formatActionName('STUDIO', 'Open the database studio'),
    value: 'db:studio',
    description: `\n${colors.muted}Open the database studio for visual management${colors.reset}\n`
  },
  {
    name: formatActionName('SEED', 'Seed the database'),
    value: 'db:seed',
    description: `\n${colors.muted}Seed the database with initial data for dev purpose${colors.reset}\n`
  },
  {
    name: formatActionName('STATUS', 'Check migration status'),
    value: 'db:status',
    description: `\n${colors.muted}Check the status of database migrations${colors.reset}\n`
  },
  {
    name: `${colors.udx}${colors.bright}←${colors.reset} BACK\n`,
    value: 'back',
    description: `${colors.muted}Return to the main menu${colors.reset}`
  }
]

const pm2Actions: MenuChoice[] = [
  {
    name: formatActionName('START', 'Start the PM2 process'),
    value: 'pm2:start',
    description: `\n${colors.muted}Start the PM2 process for the application${colors.reset}\n`
  },
  {
    name: formatActionName('START:PROD', 'Start the PM2 process in production mode'),
    value: 'pm2:start:prod',
    description: `\n${colors.muted}Start the PM2 process for the application in production mode${colors.reset}\n`
  },
  {
    name: formatActionName('STOP', 'Stop the PM2 process'),
    value: 'pm2:stop',
    description: `\n${colors.muted}Stop the PM2 process for the application${colors.reset}\n`
  },
  {
    name: formatActionName('RESTART', 'Restart the PM2 process'),
    value: 'pm2:restart',
    description: `\n${colors.muted}Restart the PM2 process for the application${colors.reset}\n`
  },
  {
    name: formatActionName('RELOAD', 'Reload the PM2 process'),
    value: 'pm2:reload',
    description: `\n${colors.muted}Reload the PM2 process for the application${colors.reset}\n`
  },
  {
    name: formatActionName('LOGS', 'View the PM2 process logs'),
    value: 'pm2:logs',
    description: `\n${colors.muted}View the logs of the PM2 process${colors.reset}\n`
  },
  {
    name: formatActionName('STATUS', 'Check the PM2 process status'),
    value: 'pm2:status',
    description: `\n${colors.muted}Check the status of the PM2 process${colors.reset}\n`
  },
  {
    name: formatActionName('DELETE', 'Delete the PM2 process'),
    value: 'pm2:delete',
    description: `\n${colors.muted}Delete the PM2 process for the application${colors.reset}\n`
  },
  {
    name: formatActionName('MONIT', 'Monitor the PM2 processes'),
    value: 'pm2:monit',
    description: `\n${colors.muted}Monitor the PM2 processes in real-time${colors.reset}\n`
  },
  {
    name: `${colors.udx}${colors.bright}←${colors.reset} BACK\n`,
    value: 'back',
    description: `${colors.muted}Return to the main menu${colors.reset}`
  }
]

const BACKGROUND_COMMANDS = ['db:studio', 'pm2:monit', 'pm2:logs']

function runNpmScript(script: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const isBackground = BACKGROUND_COMMANDS.includes(script)

    console.log(`\nEXECUTING npm run ${script}${isBackground ? ' (background)' : ''}\n`)

    const child = spawn('npm', ['run', script], {
      stdio: isBackground ? 'ignore' : 'inherit',
      cwd: process.cwd(),
      detached: isBackground
    })

    if (isBackground) {
      console.log(`${colors.green}✓${colors.reset} ${script} started in background`)
      console.log(
        `${colors.muted}You can continue using the CLI while ${script} runs${colors.reset}\n`
      )

      child.unref()
      resolve()
    } else {
      child.on('close', (code) => {
        if (code === 0) {
          console.log(
            `\n${colors.green}✓${colors.reset} npm run ${script} completed successfully\n`
          )
          resolve()
        } else {
          console.log(
            `\n${colors.red}✗${colors.reset} npm run ${script} failed with code: ${code}\n`
          )
          reject(new Error(`Command failed with code ${code}`))
        }
      })

      child.on('error', (error) => {
        console.error(`\n${colors.red}✗${colors.reset} Error while executing: ${error.message}\n`)
        reject(error)
      })
    }
  })
}

async function showMainMenu(): Promise<void> {
  try {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: `SELECT AN ACTION:`,
        choices: actions,
        pageSize: 12,
        theme: {
          prefix: '',
          icon: {
            cursor: CURSOR
          }
        }
      }
    ])

    await handleAction(answer.action)
  } catch (error) {
    if (error instanceof Error && error.name === 'ExitPromptError') {
      clearConsole()
      console.log(
        `\n\nThank you for using the ${colors.udx}${colors.bright}UDX-SERVER ${colors.udxBg}${colors.bright} CLI ${colors.reset}`
      )
      process.exit(0)
    }
    console.error('Error:', error)
    process.exit(1)
  }
}

async function showDatabaseMenu(): Promise<void> {
  try {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: `SELECT AN ACTION: ${colors.udx}${colors.bright}DATABASE${colors.reset}`,
        choices: dbActions,
        pageSize: 12,
        theme: {
          prefix: '',
          icon: {
            cursor: CURSOR
          }
        }
      }
    ])

    if (answer.action === 'back') {
      clearConsole()
      await showMainMenu()
    } else {
      await runNpmScript(answer.action)
      await showContinuePrompt()
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'ExitPromptError') {
      clearConsole()
      console.log(
        `\n\nThank you for using the ${colors.udx}${colors.bright}UDX-SERVER ${colors.udxBg}${colors.bright} CLI ${colors.reset}`
      )
      process.exit(0)
    }
    console.error('Error:', error)
    clearConsole()
    await showMainMenu()
  }
}

async function showPM2Menu(): Promise<void> {
  try {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: `SELECT AN ACTION: ${colors.udx}${colors.bright}PM2${colors.reset}`,
        choices: pm2Actions,
        pageSize: 12,
        theme: {
          prefix: '',
          icon: {
            cursor: CURSOR
          }
        }
      }
    ])

    if (answer.action === 'back') {
      clearConsole()
      await showMainMenu()
    } else {
      await runNpmScript(answer.action)
      await showContinuePrompt()
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'ExitPromptError') {
      clearConsole()
      console.log(
        `\n\nThank you for using the ${colors.udx}${colors.bright}UDX-SERVER ${colors.udxBg}${colors.bright} CLI ${colors.reset}`
      )
      process.exit(0)
    }
    console.error('Error:', error)
    clearConsole()
    await showMainMenu()
  }
}

async function showContinuePrompt(): Promise<void> {
  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'continue',
      message: `${colors.udx}Do you want to perform ${colors.bright}another action${colors.reset}${colors.udx}?${colors.reset}`,
      default: true,
      theme: {
        prefix: ''
      }
    }
  ])

  if (answer.continue) {
    clearConsole()
    await showMainMenu()
  } else {
    clearConsole()
    console.log(
      `Thank you for using the ${colors.udx}${colors.bright}UDX-SERVER ${colors.udxBg}${colors.bright} CLI ${colors.reset}`
    )
    process.exit(0)
  }
}

async function handleAction(action: string): Promise<void> {
  switch (action) {
    case 'database':
      await showDatabaseMenu()
      break
    case 'pm2':
      await showPM2Menu()
      break
    case 'exit':
      clearConsole()
      console.log(
        `Thank you for using the ${colors.udx}${colors.bright}UDX-SERVER ${colors.udxBg}${colors.bright} CLI ${colors.reset}`
      )
      process.exit(0)
      break
    default:
      try {
        await runNpmScript(action)
        await showContinuePrompt()
      } catch (error) {
        console.error('Error while executing the command')
        await showContinuePrompt()
      }
      break
  }
}

async function main(): Promise<void> {
  clearConsole()
  console.log('')
  console.log(
    `${colors.udx}${colors.bright}UDX-SERVER ${colors.udxBg}${colors.bright} CLI ${colors.reset} ${colors.udx}Welcome to the UDX Server interactive CLI.${colors.reset}`
  )
  console.log(`${colors.muted}Use the arrow keys ↑↓ to navigate and Enter to select${colors.reset}`)
  console.log('')

  await showMainMenu()
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { main }
