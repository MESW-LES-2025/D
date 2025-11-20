# TaskUp Project
TaskUp is a modern web application built with Next.js 16, React 19, and TypeScript, designed to make goal achievement fun, engaging, and rewarding.

By gamifying daily tasks, goals, and achievements, TaskUp helps companies, families, and communities stay motivated, recognize contributions, and build a culture of collaboration and progress. It features authentication, database management with Drizzle ORM, and a beautiful UI powered by Tailwind CSS and Radix UI components.

## 🚀 Tech Stack

- **Framework:** Next.js 16 with Turbopack
- **UI Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI, shadcn/ui
- **Database:** PostgreSQL with PGLite (local development)
- **ORM:** Drizzle ORM
- **Authentication:** Better Auth
- **Testing:** Vitest (unit/integration), Playwright (E2E)
- **Code Quality:** ESLint, TypeScript

## 🛠️ Running the Application

Before you begin, ensure you have the following installed:

- **Node.js:** Version 20 or higher
- **npm:** Comes with Node.js

### 1. Clone the Repository

```bash
git clone https://github.com/MESW-LES-2025/D.git
cd D
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

The project comes with a `.env` file pre-configured for local development. The database uses PGLite, which runs locally without requiring Docker or external PostgreSQL installation.

**Default configuration (`.env`):**
```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/postgres
NEXT_TELEMETRY_DISABLED=1
```

> **Note:** No additional database setup is required. PGLite is included in the project and will run automatically.

### 4. Launch the Application

Start the development server with Turbopack:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

This command will:
- Start the PGLite database server with file persistence (`local.db`)
- Launch the Next.js development server with Turbopack

## 🧪 Testing

The project includes four types of tests:

- **Unit tests** (Vitest)
- **Integration tests** (Vitest)
- **Static analysis** (ESLint)
- **End-to-End (E2E) tests** (Playwright)

**Run tests locally:**

- Unit & integration:
  ```bash
  npm test
  ```
- Static analysis (lint):
  ```bash
  npm run lint
  ```
- E2E tests:
  ```bash
  npm run test:e2e
  ```

#### 📝 Important Note About E2E Tests

**E2E tests are NOT run in GitHub Actions and should be executed locally on your machine.**

**Why?**
- **Performance Constraints:** GitHub Actions is too slow to efficiently run demanding tasks like E2E tests.
- **Resource Limitations:** The volume of GitHub Actions usage required for E2E testing is not feasible for the class organization.

## 📁 Project Structure

```
D/
├── src/                    # Source code
├── tests/                  # Test suites
├── migrations/             # Database migrations
├── public/                 # Static assets
├── docs/                   # Documentation
├── .github/                # GitHub issues and workflows
├── package.json            # Dependencies and scripts
├── playwright.config.ts    # Playwright configuration
├── vitest.config.mts       # Vitest configuration
├── drizzle.config.ts       # Drizzle ORM configuration
├── next.config.ts          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
└── tailwind.config.js      # Tailwind CSS configuration
```

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with database |
| `npm run dev:next` | Start Next.js dev server only |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run all tests |
| `npm run test:unit` | Run unit tests |
| `npm run test:integration` | Run integration tests |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run lint` | Lint code |
| `npm run lint:fix` | Fix linting issues |
| `npm run check:types` | Type check with TypeScript |
| `npm run db:generate` | Generate database migrations |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run clean` | Remove build artifacts |
