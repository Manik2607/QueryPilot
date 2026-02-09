# QueryPilot Backend Server

Backend API server for QueryPilot - an AI-powered database query interface that converts natural language questions into SQL queries.

## Features

- 🤖 Natural language to SQL conversion using Google Gemini AI
- 🗄️ Multi-database support (PostgreSQL, MySQL, SQLite)
- ✅ SQL query validation and safety checks
- 🔒 Read-only query enforcement
- 📊 Schema introspection
- 🚀 RESTful API with Express.js
- 📝 TypeScript for type safety

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **AI/LLM**: Google Gemini API
- **Databases**: PostgreSQL (pg), MySQL (mysql2), SQLite (better-sqlite3)
- **Validation**: Zod
- **SQL Formatting**: sql-formatter

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── env.ts                 # Environment configuration
│   ├── controllers/
│   │   ├── chat.controller.ts     # Chat endpoint logic
│   │   ├── database.controller.ts # Database connection logic
│   │   └── validate.controller.ts # Query validation logic
│   ├── middleware/
│   │   └── error-handler.ts       # Error handling middleware
│   ├── routes/
│   │   ├── chat.routes.ts         # Chat API routes
│   │   ├── database.routes.ts     # Database API routes
│   │   └── validate.routes.ts     # Validation API routes
│   ├── services/
│   │   ├── ai/
│   │   │   └── gemini.service.ts  # Gemini AI integration
│   │   ├── database/
│   │   │   ├── connection.service.ts # Connection manager
│   │   │   ├── postgres.adapter.ts   # PostgreSQL adapter
│   │   │   ├── mysql.adapter.ts      # MySQL adapter
│   │   │   └── sqlite.adapter.ts     # SQLite adapter
│   │   └── validation/
│   │       └── sql-validator.service.ts # SQL validation
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   ├── app.ts                     # Express app configuration
│   └── index.ts                   # Server entry point
├── .env.example                   # Environment variables template
├── .gitignore
├── nodemon.json                   # Nodemon configuration
├── package.json
├── tsconfig.json                  # TypeScript configuration
└── README.md                      # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- At least one database:
  - PostgreSQL 12+ (optional)
  - MySQL 8+ (optional)
  - SQLite 3+ (optional)

### Installation

1. **Navigate to server directory**:

   ```bash
   cd server
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables**:

   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file** with your configuration:

   ```env
   # Required
   GEMINI_API_KEY=your_actual_api_key_here

   # Optional - configure at least one database
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_DB=your_database
   POSTGRES_USER=your_username
   POSTGRES_PASSWORD=your_password
   ```

### Running the Server

#### Development Mode (with auto-reload)

```bash
npm run dev
```

#### Production Build

```bash
npm run build
npm start
```

The server will start on `http://localhost:3001` by default.

## API Endpoints

### Health Check

```http
GET /health
```

Check if the server is running.

**Response**:

```json
{
  "status": "ok",
  "timestamp": "2026-02-09T10:30:00.000Z",
  "environment": "development"
}
```

### Chat - Convert Natural Language to SQL

```http
POST /api/chat
```

Convert a natural language question to SQL and execute it.

**Request Body**:

```json
{
  "question": "Show me all users",
  "database": "postgresql",
  "schema": {
    "tables": [...]
  }
}
```

**Response**:

```json
{
  "sql": "SELECT * FROM users",
  "results": [...],
  "rowCount": 10
}
```

### Database - Connect to Database

```http
POST /api/databases
```

Test and establish a database connection.

**Request Body (PostgreSQL/MySQL)**:

```json
{
  "type": "postgresql",
  "credentials": {
    "host": "localhost",
    "port": 5432,
    "database": "mydb",
    "user": "username",
    "password": "password"
  }
}
```

**Request Body (SQLite)**:

```json
{
  "type": "sqlite",
  "credentials": {
    "path": "./database.sqlite"
  }
}
```

**Response**:

```json
{
  "success": true,
  "message": "Successfully connected to postgresql database",
  "schema": {
    "tables": [...]
  }
}
```

### Validate - Validate SQL Query

```http
POST /api/validate
```

Validate a SQL query without executing it.

**Request Body**:

```json
{
  "sql": "SELECT * FROM users",
  "database": "postgresql"
}
```

**Response**:

```json
{
  "valid": true,
  "errors": []
}
```

## Security Features

### SQL Injection Prevention

- Parameterized queries where applicable
- Input validation and sanitization
- Query validation before execution

### Query Safety

- **Whitelist**: Only SELECT, SHOW, DESCRIBE, EXPLAIN queries allowed
- **Blacklist**: DROP, DELETE, UPDATE, TRUNCATE, ALTER, etc. are blocked
- **Single statement**: Multiple SQL statements are not allowed
- **Read-only**: No data modification operations permitted

## Error Handling

All errors follow this format:

```json
{
  "error": true,
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

- `CONNECTION_ERROR`: Database connection failed
- `INVALID_SQL`: SQL validation failed
- `QUERY_EXECUTION_ERROR`: Query execution failed

## Environment Variables

| Variable            | Required | Default                 | Description           |
| ------------------- | -------- | ----------------------- | --------------------- |
| `NODE_ENV`          | No       | `development`           | Environment mode      |
| `PORT`              | No       | `3001`                  | Server port           |
| `CLIENT_URL`        | No       | `http://localhost:3000` | Frontend URL for CORS |
| `GEMINI_API_KEY`    | Yes      | -                       | Google Gemini API key |
| `POSTGRES_HOST`     | No       | `localhost`             | PostgreSQL host       |
| `POSTGRES_PORT`     | No       | `5432`                  | PostgreSQL port       |
| `POSTGRES_DB`       | No       | -                       | PostgreSQL database   |
| `POSTGRES_USER`     | No       | -                       | PostgreSQL username   |
| `POSTGRES_PASSWORD` | No       | -                       | PostgreSQL password   |
| `MYSQL_HOST`        | No       | `localhost`             | MySQL host            |
| `MYSQL_PORT`        | No       | `3306`                  | MySQL port            |
| `MYSQL_DB`          | No       | -                       | MySQL database        |
| `MYSQL_USER`        | No       | -                       | MySQL username        |
| `MYSQL_PASSWORD`    | No       | -                       | MySQL password        |
| `SQLITE_PATH`       | No       | `./database.sqlite`     | SQLite database path  |

## Development

### Type Checking

```bash
npx tsc --noEmit
```

### Build

```bash
npm run build
```

The compiled JavaScript will be in the `dist/` directory.

## Troubleshooting

### "GEMINI_API_KEY is not configured"

Make sure you've set `GEMINI_API_KEY` in your `.env` file with a valid API key.

### "Database not connected"

Ensure you've called the `/api/databases` endpoint to establish a connection before sending queries.

### Connection errors

- Verify database credentials in `.env`
- Ensure database server is running
- Check firewall/network settings
- For PostgreSQL/MySQL, verify the database exists

### Port already in use

Change the `PORT` in `.env` to a different value (e.g., `3002`).

## Contributing

1. Create a new branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
