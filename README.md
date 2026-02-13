# QueryPilot

An AI-powered database query interface that allows users to interact with databases using natural language. Ask questions in plain English, and QueryPilot converts them into SQL queries and executes them against your connected databases.

## Features

✨ **Natural Language Processing**: Convert plain text questions into SQL queries using AI  
🤖 **Powered by Google Gemini**: Advanced AI for accurate query generation  
🗄️ **Multi-Database Support**: Works with PostgreSQL, MySQL, and SQLite  
💬 **Chat Interface**: Conversational UI similar to popular chat applications  
🛡️ **Query Safety**: Built-in validation to prevent destructive operations  
📊 **Real-time Results**: Execute queries and see results instantly  
🎨 **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS

## Architecture

QueryPilot is a full-stack application with a clear separation between frontend and backend:

- **Frontend** (`/client`): Next.js 14 application with TypeScript and Tailwind CSS
- **Backend** (`/server`): Express.js API server with TypeScript, database adapters, and AI integration

## Tech Stack

### Frontend

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/UI components

### Backend

- Node.js & Express.js
- TypeScript
- Google Gemini API
- PostgreSQL, MySQL, SQLite drivers

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- At least one database (PostgreSQL, MySQL, or SQLite)

### Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd QueryPilot
   ```

2. **Setup Backend**:

   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY and database credentials
   ```

3. **Setup Frontend**:
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

You'll need two terminal windows:

**Terminal 1 - Backend**:

```bash
cd server
npm run dev
```

Backend runs on `http://localhost:3001`

**Terminal 2 - Frontend**:

```bash
cd client
npm run dev
```

Frontend runs on `http://localhost:3000`

Open your browser to `http://localhost:3000` to use QueryPilot!

## Usage Guide

### 1. Connect to a Database

1. Select your database type (PostgreSQL, MySQL, or SQLite)
2. Enter connection credentials
3. Click "Connect"

### 2. Ask Questions in Natural Language

Once connected, you can ask questions like:

- "Show me all users"
- "How many orders were placed last month?"
- "List the top 10 products by sales"
- "What are the most recent customer registrations?"

### 3. View Results

QueryPilot will:

1. Convert your question to SQL
2. Display the generated SQL query
3. Execute the query safely
4. Show results in a table format

## Configuration

### Backend Environment Variables

Create a `.env` file in the `/server` directory:

```env
# Required
GEMINI_API_KEY=your_api_key_here

# Server Config
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:3000

# Database credentials (configure at least one)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=your_database
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=your_database
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password

SQLITE_PATH=./database.sqlite
```

### Frontend Environment Variables (Optional)

Create a `.env.local` file in the `/client` directory if you need to customize the API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Project Structure

```
QueryPilot/
├── client/                      # Frontend (Next.js)
│   ├── app/                     # Next.js App Router
│   ├── components/              # React components
│   │   ├── ChatInterface.tsx   # Main chat UI
│   │   ├── MessageList.tsx     # Message history
│   │   ├── QueryInput.tsx      # User input
│   │   ├── ResultsDisplay.tsx  # Query results table
│   │   └── ConnectionPanel.tsx # Database connection UI
│   ├── lib/
│   │   └── api-client.ts       # API client
│   └── package.json
├── server/                      # Backend (Express.js)
│   ├── src/
│   │   ├── config/             # Configuration
│   │   ├── controllers/        # Route controllers
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   │   ├── ai/            # Gemini AI service
│   │   │   ├── database/      # Database adapters
│   │   │   └── validation/    # SQL validation
│   │   ├── types/             # TypeScript types
│   │   ├── app.ts             # Express app
│   │   └── index.ts           # Entry point
│   └── package.json
├── CONTEXT.md                   # Detailed project documentation
└── README.md                    # This file
```

## API Endpoints

The backend exposes three main endpoints:

### POST `/api/chat`

Convert natural language to SQL and execute

**Request**:

```json
{
  "question": "Show me all users",
  "database": "postgresql",
  "schema": { ... }
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

### POST `/api/databases`

Connect to a database

**Request**:

```json
{
  "type": "postgresql",
  "credentials": {
    "host": "localhost",
    "port": 5432,
    "database": "mydb",
    "user": "user",
    "password": "pass"
  }
}
```

### POST `/api/validate`

Validate SQL query without executing

**Request**:

```json
{
  "sql": "SELECT * FROM users",
  "database": "postgresql"
}
```

## Security

QueryPilot implements multiple security measures:

### SQL Injection Prevention

- Input validation and sanitization
- Parameterized queries
- Query validation before execution

### Query Safety

- **Read-only mode**: Only SELECT, SHOW, DESCRIBE, EXPLAIN queries allowed
- **Blacklist**: Dangerous operations (DROP, DELETE, UPDATE, etc.) are blocked
- **Single statement**: Multiple SQL statements are not permitted
- **Validation**: All queries validated before execution

### Connection Security

- Credentials stored in environment variables
- No hardcoded credentials
- Secure connection handling

## Troubleshooting

### Backend won't start

- Ensure `GEMINI_API_KEY` is set in `/server/.env`
- Check that port 3001 is available
- Verify Node.js version is 18+

### Frontend can't connect to backend

- Ensure backend is running on port 3001
- Check CORS settings in backend
- Verify `NEXT_PUBLIC_API_URL` if using custom backend URL

### Database connection fails

- Verify database credentials in `.env`
- Ensure database server is running and accessible
- Check firewall settings
- For PostgreSQL/MySQL, verify database exists

### AI queries not working

- Verify `GEMINI_API_KEY` is valid
- Check Google Gemini API quota/limits
- Review backend logs for error details

## Development

### Backend Development

```bash
cd server
npm run dev     # Start with auto-reload
npm run build   # Build for production
npm start       # Run production build
```

### Frontend Development

```bash
cd client
npm run dev     # Start dev server
npm run build   # Build for production
npm start       # Run production build
```

## Production Deployment

### Backend

1. Build: `cd server && npm run build`
2. Deploy `dist/` folder to Node.js hosting (AWS, Heroku, DigitalOcean, etc.)
3. Set environment variables on hosting platform
4. Start: `npm start`

### Frontend

1. Build: `cd client && npm run build`
2. Deploy to Vercel, Netlify, or static hosting
3. Set `NEXT_PUBLIC_API_URL` to production backend URL

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### How to Add Collaborators

If you want to add someone to work on this repository, see the detailed guide in [CONTRIBUTING.md](CONTRIBUTING.md#adding-collaborators-to-the-repository).

### For Contributors

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed information on:
- Setting up your development environment
- Making your first contribution
- Code guidelines and best practices
- Getting help

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

---

**Made with ❤️ using Next.js, Express.js, and Google Gemini**
