# AGENTS.md

## Commands
- Dev server: `npm run dev` (Vite on port 61924)
- Build: `npm run build`
- Lint: `npm run lint` (ESLint with React hooks rules)
- No test commands (no tests configured)

## Architecture
- React 19 frontend with Vite build tool
- React Router for client-side routing
- Role-based authentication (manager/admin/receptionist/housekeeper/service staff)
- Protected routes with JWT tokens
- Hotel management system with customer and staff interfaces
- Uses TailwindCSS for styling, Axios for API calls

## Structure
- `src/pages/`: Route components (customer/ and staff/ subdirs)
- `src/components/`: Reusable components (base/, feature/, layout/, security/, chatbot/)
- `src/hooks/`: Custom React hooks
- `src/utils/`: Utility functions
- `src/assets/`: Static assets

## Code Style
- PascalCase for component names, camelCase for variables/functions
- Import order: React, third-party libraries, local imports with aliases
- Use aliases: @components, @hooks, @assets, @utils
- JSX in .jsx files, functional components with hooks
- ESLint: no-unused-vars (ignores uppercase constants), React hooks rules
- Error handling: try-catch blocks, console.error for logging
