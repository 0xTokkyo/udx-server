/// <reference types="node" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
      DB_FILE_NAME: string
      SERVER_PORT: number
      UDX_SECRET: string
      // Other env-var
      [key: string]: string | undefined
    }
  }
}

export {}