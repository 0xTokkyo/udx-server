# UDX-SERVER

A server built with Express and TypeScript that serves as the backend for the UDX App, a Star Citizen companion app. This server provides secure communication endpoints (RESTful API), data management, WebSocket functionality for the UDX ecosystem and more.

## Overview

UDX-SERVER is designed to work as the backend counterpart to [UDX](https://github.com/0xTokkyo/udx) and provides:

- CLI for project management
- RESTful API endpoints for data operations
- Secure authentication using JWT tokens
- Real-time communication via WebSocket
- File storage management (public/private)
- Database operations with SQLite and Drizzle ORM
- Environment-based configuration with encrypted production settings

## Quick Setup
```bash
# clone the project
git clone https://github.com/0xTokkyo/udx-server.git

# navigate to the project directory
cd udx-server

# run the genesis command to set up everything
npm run genesis
```

That's it! You can now start working on the project.

### Manual Setup

If you prefer manual setup or need to run steps individually:

1. **Clone the repository**
   ```bash
   git clone https://github.com/0xTokkyo/udx-server.git
   cd udx-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   npm run sync-envx
   ```

4. **Database setup**
   ```bash
   npm run db:init
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Project Structure

```
udx-server/
├── data/                   # Database files
│   └── udx.db              # SQLite database
├── drizzle/                # Database migrations
├── env/                    # Environment configuration files
├── src/
│   ├── controllers/        # Route controllers
│   ├── db/                 # Database configuration and schema
│   ├── middleware/         # Express middleware
│   ├── routes/             # API route definitions
│   ├── services/           # Logic services
│   ├── storage/            # File storage (public/private)
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions and helpers
│   └── server.ts           # Main server entry point
├── dev/                    # Development utilities
│   └── mts/                # TypeScript utility scripts
├── logs/                   # Application logs
└── tasks/                  # Shell scripts for maintenance
```

## Features

- **CLI** for easy project setup and management
- **TypeScript** support for type safety
- **Express.js** server with TypeScript
- **SQLite** database with **Drizzle ORM**
- **JWT** authentication system
- **WebSocket** support for real-time communication
- **File Management** and **Storage Management**
- **Security Middlewares** like Helmet and CORS
- **Environment encryption** with dotenvx
- **PM2** process management
- **Winston** logging system


## Environment Configuration

### Environment Files

The project uses multiple environment files located in the `env/` directory:

- `.env.exemple` - Template file with example values
- `.env.schema` - Schema file used as fallback by the sync-envx script
- `.env` - Development environment variables
- `.env.production` - Encrypted production environment variables

### Required Environment Variables

```bash
DB_FILE_NAME='udx'                    # Database filename (without .db extension)
SERVER_PORT=3004                      # Server port number
UDX_SECRET='your-secret-key'          # Secret key for UDX Electron app communication
JWT_SECRET='your-jwt-secret'          # JWT signing secret
JWT_EXPIRES_IN='21d'                  # JWT expiration time
```

### The sync-envx Script

The `sync-envx` script is a crucial utility that manages environment file synchronization and encryption:

**What it does:**
- Synchronizes `.env` file to `.env.production`
- Re-encrypts the production environment file using dotenvx
- Automatically creates `.env` from `.env.schema` if it doesn't exist
- Ensures environment consistency across different deployment stages

**When it runs:**
- Automatically before `dev`, `build`, `start`, and `pm2` commands
- Can be run manually with `npm run sync-envx`

**Process:**
1. Validates that `.env` file exists (creates from `.env.schema` if missing)
2. Copies `.env` to `.env.production`
3. Encrypts `.env.production` using dotenvx encryption
4. Preserves the original `.env` file for development use

## Authentication & Security

### UDX Secret Token

The server requires a secret token (`UDX_SECRET`) for secure communication with the UDX Electron application. This token must be:

- Set in the environment variables
- Passed as `X-UDX-SECRET` header in requests from the UDX Electron app
- Kept secure and not exposed in client-side code. However, you can expose the encrypted `.env.production`

**Security behavior:**
- If `UDX_SECRET` is missing or empty, the server will terminate immediately
- Requests without valid `X-UDX-SECRET` header receive 403 Forbidden response
- Auth and API routes (`/auth/*`, `/api/*`) bypass this middleware

### Additional Security Features

- **Helmet.js** for security headers
- **CORS** protection with configurable origins
- **Rate limiting** to prevent abuse
- **JWT** token-based authentication
- **Cookie parsing** with security options

## Available Scripts

### Development
```bash
npm run dev          # Start development server with file watching
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm run start:test   # Start server without building (for testing)
```

### Database Management
```bash
npm run db:init      # Initialize database (generate + migrate)
npm run db:generate  # Generate migration files
npm run db:migrate   # Run pending migrations
npm run db:rollback  # Rollback last migration
npm run db:push      # Push schema changes directly
npm run db:studio    # Open Drizzle Studio (database GUI)
npm run db:seed      # Seed database with initial data
npm run db:status    # Check migration status
```

### Process Management (PM2)
```bash
npm run pm2:start         # Start with PM2 (development)
npm run pm2:start:prod    # Start with PM2 (production)
npm run pm2:stop          # Stop PM2 process
npm run pm2:restart       # Restart PM2 process
npm run pm2:reload        # Reload PM2 process (zero-downtime)
npm run pm2:delete        # Delete PM2 process
npm run pm2:status        # Check PM2 status
npm run pm2:logs          # View PM2 logs
npm run pm2:monit         # Open PM2 monitoring
```

### Utilities
```bash
npm run cli          # Run CLI utility
npm run sync-envx    # Synchronize and encrypt environment files
```

## API Endpoints

The server provides RESTful API endpoints under `/api` prefix. Common endpoints include:

- Authentication routes
- Data CRUD operations
- File upload/download
- WebSocket connections for real-time features
- More will come as the project evolves but the core functionality is already in place and you can create custom endpoints as needed.

## WebSocket Support

The server includes WebSocket functionality for real-time communication with the UDX Electron application. WebSocket connections are established automatically when the server starts. For the need of UDX, websocket is used in two main ways: `UserRoom` and `OrgRoom`.

## Database

### Technology Stack
- **SQLite** as the database engine
- **Drizzle ORM** for type-safe database operations
- **Better SQLite3** driver for performance

### Database Files
- Database files are stored in the `data/` directory
- Default database name: `udx.db` (configurable via `DB_FILE_NAME`)
- Includes WAL mode for better concurrency

### Migrations
Database schema changes are managed through Drizzle migrations:
- Migration files are stored in `drizzle/` directory
- Run `npm run db:generate` after schema changes
- Apply migrations with `npm run db:migrate`

## Logging

The server uses Winston for comprehensive logging:

- **Development**: Console output with colored formatting
- **Production**: File-based logging with daily rotation
- **Log Files**: Stored in `logs/` directory
  - `combined-YYYY-MM-DD.log` - All logs
  - `error-YYYY-MM-DD.log` - Error logs only
  - `exceptions-YYYY-MM-DD.log` - Uncaught exceptions
  - `rejections-YYYY-MM-DD.log` - Unhandled promise rejections

## File Storage

The server provides file storage capabilities:

- **Public Storage**: `/s/public` - Accessible via HTTP
- **Private Storage**: Secured storage for sensitive files
- **Upload Support**: Multipart file upload with Multer

## Deployment

### Development
```bash
npm run genesis  # Complete setup and start
# or
npm run dev      # Start development server only
```

### Production with PM2
```bash
npm run pm2:start:prod
```

### Environment Considerations
- Ensure all environment variables are properly set
- Run `sync-envx` before deployment to encrypt production settings
- Configure proper CORS origins for your domain
- Set up proper SSL certificates for HTTPS

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Related Projects

- [UDX](https://github.com/0xTokkyo/udx) - The main UDX desktop application for Windows, Linux and macOS

## Support

For issues and questions:
- Open an issue on the [UDX-SERVER repository](https://github.com/0xTokkyo/udx-server/issues)
- Check the logs in the `logs/` directory for troubleshooting
- Use `npm run db:studio` to inspect database contents