# FreshMarket - Online Grocery Store

## Overview

FreshMarket is a full-stack e-commerce application for an online grocery store targeting the Uzbekistan market. The application allows customers to browse products, manage shopping carts, place orders, and track order status. It includes a complete admin panel for managing products, categories, orders, and users.

The interface is localized in Uzbek language with features including product browsing by category, search and filtering, shopping cart management, order checkout, and user authentication with JWT tokens.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack React Query for server state, React Context for auth state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (supports dark/light mode)
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with HMR support

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **API Design**: RESTful API with JSON responses
- **Middleware**: Custom authentication and admin authorization middleware

### Data Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **Schema**: Defined in `shared/schema.ts` with Zod validation schemas auto-generated via drizzle-zod
- **Migrations**: Managed through drizzle-kit with push command

### Project Structure
```
├── client/           # React frontend application
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Route page components
│       ├── lib/          # Utilities and context providers
│       └── hooks/        # Custom React hooks
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Database operations interface
│   ├── db.ts         # Database connection
│   └── seed.ts       # Database seeding
├── shared/           # Shared code between frontend and backend
│   └── schema.ts     # Drizzle schema and Zod types
└── migrations/       # Database migration files
```

### Key Design Decisions

1. **Monorepo Structure**: Frontend and backend share a single repository with shared types in the `shared/` directory, ensuring type safety across the stack.

2. **JWT Authentication**: Stateless authentication using JWT tokens stored in localStorage, with tokens passed via Authorization header.

3. **Role-Based Access Control**: Two roles (user, admin) with middleware protecting admin routes.

4. **Storage Interface Pattern**: The `IStorage` interface in `storage.ts` abstracts database operations, making it easier to swap implementations if needed.

5. **Path Aliases**: TypeScript path aliases (`@/` for client, `@shared/` for shared) improve import readability.

## External Dependencies

### Database
- **PostgreSQL**: Primary database accessed via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe query builder and schema management

### Authentication
- **jsonwebtoken**: JWT token generation and verification
- **bcrypt**: Password hashing

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Form state management
- **zod**: Schema validation
- **date-fns**: Date formatting utilities

### UI Framework
- **shadcn/ui**: Component library (not installed as dependency, components copied to `client/src/components/ui/`)
- **Radix UI**: Accessible primitive components
- **Tailwind CSS**: Utility-first CSS framework
- **lucide-react**: Icon library

### Build Tools
- **Vite**: Frontend bundler with React plugin
- **esbuild**: Backend bundler for production builds
- **tsx**: TypeScript execution for development

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret key for JWT signing (defaults to fallback in development)