# Level-3-Fullstack-CRUD

A project management Kanban board built entirely on the Cloudflare ecosystem. Create projects, then manage tasks across three status columns (To Do, In Progress, Done) with a responsive, mobile-first interface.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 6 |
| API | Cloudflare Pages Functions (file-based routing) |
| Database | Cloudflare D1 (serverless SQLite) |
| Hosting | Cloudflare Pages |

## Features

- Create, rename, and delete projects
- Add tasks to any project with automatic position ordering
- Move tasks between To Do, In Progress, and Done columns
- Responsive Kanban board (3 columns on desktop, stacked on mobile)
- Full REST API with parameterized queries (no SQL injection)
- Cascading deletes (removing a project removes all its tasks)
- UUIDs for all record IDs (no sequential auto-increment)

## Project Structure

```
Level-3-Fullstack-CRUD/
  database/
    schema.sql            # D1 table definitions
  frontend/
    functions/api/        # Cloudflare Pages Functions (REST API)
      _helpers.js         # Shared response utilities
      projects/
        index.js          # GET /api/projects, POST /api/projects
        [id].js           # GET/PUT/DELETE /api/projects/:id
      tasks/
        index.js          # GET /api/tasks?project_id=, POST /api/tasks
        [id].js           # PUT/DELETE /api/tasks/:id
    src/
      api.js              # Fetch-based API client
      hooks/
        useProjects.js    # Project CRUD state management
        useTasks.js       # Task CRUD with per-status grouping
      components/
        ProjectList.jsx   # Sidebar project list with create/delete
        KanbanBoard.jsx   # Three-column board with task cards
      App.jsx             # Root layout component
      App.css             # Mobile-first responsive styles
      main.jsx            # React entry point
    index.html            # HTML shell
    package.json
    vite.config.js        # Vite config with /api proxy for local dev
    wrangler.toml         # Cloudflare Pages + D1 binding config
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create a project |
| GET | `/api/projects/:id` | Get project with its tasks |
| PUT | `/api/projects/:id` | Update project name/description |
| DELETE | `/api/projects/:id` | Delete project and its tasks |
| GET | `/api/tasks?project_id=` | List tasks for a project |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update task title/description/status |
| DELETE | `/api/tasks/:id` | Delete a task |

## Local Development

```bash
cd frontend
npm install

# Create a local D1 database
npx wrangler d1 create codveda-kanban-db
# Update database_id in wrangler.toml with the returned ID

# Apply the schema
npx wrangler d1 execute codveda-kanban-db --local --file=../database/schema.sql

# Start local dev server (Vite + Pages Functions + D1)
npx wrangler pages dev dist -- npm run dev
```

## Deployment to Cloudflare

```bash
# 1. Create the D1 database (if not created)
npx wrangler d1 create codveda-kanban-db
# Copy the database_id into wrangler.toml

# 2. Apply schema to production D1
npx wrangler d1 execute codveda-kanban-db --file=../database/schema.sql

# 3. Build and deploy to Cloudflare Pages
npm run build
npx wrangler pages deploy dist --project-name=codveda-kanban

# The app will be available at:
# https://codveda-kanban.pages.dev
```

## Database Schema

**projects** table:
- `id` TEXT PRIMARY KEY (UUID)
- `name` TEXT NOT NULL
- `description` TEXT
- `created_at` / `updated_at` DATETIME

**tasks** table:
- `id` TEXT PRIMARY KEY (UUID)
- `project_id` TEXT REFERENCES projects(id) ON DELETE CASCADE
- `title` TEXT NOT NULL
- `description` TEXT
- `status` TEXT DEFAULT 'todo' (todo | in_progress | done)
- `position` INTEGER DEFAULT 0
- `created_at` / `updated_at` DATETIME
- Composite index on (project_id, status, position)
