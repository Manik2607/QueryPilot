# Contributing to QueryPilot

Thank you for your interest in contributing to QueryPilot! This guide will help you get started whether you're a project maintainer looking to add collaborators or a new contributor wanting to help improve the project.

## Adding Collaborators to the Repository

If you're a repository owner or administrator and want to add someone to work on this repository, follow these steps:

### For Repository Owners

1. **Navigate to the Repository Settings**
   - Go to the QueryPilot repository on GitHub: `https://github.com/Manik2607/QueryPilot`
   - Click on the **Settings** tab (you need admin access to see this)

2. **Access Collaborators**
   - In the left sidebar, click on **Collaborators** (or **Collaborators and teams** for organizations)
   - You may need to enter your GitHub password to confirm

3. **Add a New Collaborator**
   - Click the **Add people** button
   - Enter the GitHub username or email address of the person you want to add
   - Select the person from the dropdown list
   - Choose their permission level:
     - **Read**: Can view and clone the repository
     - **Write**: Can push to the repository and manage issues/PRs
     - **Admin**: Full access including settings and managing collaborators

4. **Confirmation**
   - Click **Add [username] to this repository**
   - The person will receive an invitation email
   - They need to accept the invitation to start contributing

### For Organization Repositories

If this repository is part of an organization:

1. Go to repository **Settings** → **Collaborators and teams**
2. You can add either:
   - **Individual collaborators** (same process as above)
   - **Teams** (click "Add teams" and select from organization teams)

## For New Contributors

Welcome! Here's how to get started contributing to QueryPilot:

### First Time Setup

1. **Fork the Repository** (if you're not a direct collaborator)
   ```bash
   # Click the "Fork" button on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/QueryPilot.git
   cd QueryPilot
   ```

2. **Or Clone Directly** (if you're a collaborator)
   ```bash
   git clone https://github.com/Manik2607/QueryPilot.git
   cd QueryPilot
   ```

3. **Set Up the Development Environment**
   
   Follow the setup instructions in the [README.md](README.md):
   
   ```bash
   # Install backend dependencies
   cd server
   npm install
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   
   # Install frontend dependencies
   cd ../client
   npm install
   ```

4. **Create a Branch for Your Work**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

### Making Changes

1. **Make your changes** in your branch
2. **Test thoroughly**:
   ```bash
   # Test backend
   cd server
   npm run dev
   
   # Test frontend (in a separate terminal)
   cd client
   npm run dev
   ```

3. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Brief description of your changes"
   ```

4. **Push to GitHub**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**:
   - Go to the repository on GitHub
   - Click "Pull requests" → "New pull request"
   - Select your branch and create the PR
   - Describe your changes clearly

### Contribution Guidelines

- **Code Style**: Follow the existing code style and conventions
- **Documentation**: Update documentation if you change functionality
- **Testing**: Ensure your changes don't break existing features
- **Commits**: Write clear, descriptive commit messages
- **Pull Requests**: 
  - Keep PRs focused on a single feature or fix
  - Provide a clear description of what and why
  - Reference any related issues

### Areas for Contribution

We welcome contributions in:

- 🐛 **Bug fixes**: Fix issues and improve stability
- ✨ **New features**: Add support for new databases, improve AI queries, enhance UI
- 📝 **Documentation**: Improve setup guides, add tutorials, clarify usage
- 🧪 **Testing**: Add tests to improve code quality
- 🎨 **UI/UX**: Enhance the user interface and experience
- ⚡ **Performance**: Optimize queries, improve response times
- 🔒 **Security**: Identify and fix security vulnerabilities

### Getting Help

- 💬 **Questions**: Open a GitHub Discussion or Issue
- 🐛 **Report Bugs**: Use the GitHub Issues page
- 💡 **Suggest Features**: Create a feature request issue
- 📧 **Contact**: Reach out to the maintainers through GitHub

## Development Workflow

### Backend Development

```bash
cd server
npm run dev     # Start with auto-reload
npm run build   # Build TypeScript
npm start       # Run production build
```

### Frontend Development

```bash
cd client
npm run dev     # Start Next.js dev server with hot reload
npm run build   # Build for production
npm run start   # Run production build
```

### Code Structure

- `client/` - Next.js frontend application
  - `app/` - Next.js App Router pages
  - `components/` - React components
  - `lib/` - Utilities and API client
  
- `server/` - Express.js backend
  - `src/config/` - Configuration files
  - `src/controllers/` - Route handlers
  - `src/services/` - Business logic (AI, database, validation)
  - `src/routes/` - API routes
  - `src/types/` - TypeScript type definitions

## Questions?

If you have questions about contributing or adding collaborators, please:

1. Check the [README.md](README.md) for setup instructions
2. Look through existing [GitHub Issues](https://github.com/Manik2607/QueryPilot/issues)
3. Create a new issue if your question isn't answered

Thank you for contributing to QueryPilot! 🚀
