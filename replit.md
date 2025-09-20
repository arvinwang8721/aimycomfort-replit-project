# Overview

This is a comprehensive Product Development & Inventory Management System designed for pillow and cushion manufacturing. The application manages the complete product lifecycle from fabric sourcing and design ideation to product development and client requirements tracking. It features a modern React frontend with a full inventory management system, cost tracking, and collaborative design workflows.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for type safety and modern development
- **Vite** as the build tool for fast development and optimized production builds
- **Wouter** for lightweight client-side routing instead of React Router
- **shadcn/ui** component library with Radix UI primitives for accessible, customizable components
- **Tailwind CSS** for utility-first styling with a custom design system based on Material Design 3
- **TanStack Query** for server state management, caching, and synchronization
- **React Hook Form** with Zod validation for form handling

## Backend Architecture
- **Express.js** server with TypeScript
- **RESTful API** design with route organization
- **In-memory storage** interface with plans for database integration
- **Session-based architecture** with connection pooling support

## Database Design
- **PostgreSQL** with Neon serverless hosting
- **Drizzle ORM** for type-safe database operations and migrations
- **Core entities**: Fabrics, Accessories, Design Ideas, Products, Client Requirements
- **Comprehensive schema** with pricing, cost tracking, and status management
- **UUID primary keys** for scalability

## Design System
- **Material Design 3** principles adapted for enterprise use
- **Dual theme support** (light/dark) with system preference detection
- **Professional color palette** with blue primary for trust and reliability
- **Inter font family** for clean, readable typography
- **Consistent spacing** using Tailwind's 4px-based scale
- **Component hierarchy** with cards, tables, and specialized data display components

## Key Features Architecture
- **Modular page structure** for Fabrics, Accessories, Design Ideas, Products, Client Requirements
- **Cost calculation system** with breakdown tracking (cover, core, packaging, general costs)
- **Status management** for products and design ideas with workflow tracking
- **Image upload and display** system for visual inventory management
- **3D model integration** capabilities for product visualization
- **Monthly progress tracking** with dashboard widgets
- **Search and filtering** across all inventory categories

## Development Patterns
- **Component composition** with reusable card components for each entity type
- **Mock data integration** with clear TODO markers for API replacement
- **Responsive design** with mobile-first approach
- **Accessibility focus** through Radix UI primitives and semantic HTML
- **Type safety** throughout with shared schema between frontend and backend

# External Dependencies

## Core Framework Dependencies
- **React 18** with React DOM for the frontend framework
- **Express.js** for the backend server
- **TypeScript** for type safety across the entire stack

## Database & ORM
- **@neondatabase/serverless** for PostgreSQL hosting
- **drizzle-orm** for database operations and schema management
- **drizzle-kit** for database migrations and tooling

## UI & Styling
- **@radix-ui** components (40+ component packages) for accessible UI primitives
- **tailwindcss** for utility-first CSS framework
- **class-variance-authority** for component variant management
- **lucide-react** for consistent iconography

## State Management & Forms
- **@tanstack/react-query** for server state management
- **react-hook-form** with **@hookform/resolvers** for form handling
- **zod** with **drizzle-zod** for schema validation

## Development Tools
- **Vite** for build tooling and development server
- **tsx** for TypeScript execution in development
- **esbuild** for production builds

## Routing & Navigation
- **wouter** for lightweight client-side routing

## Date & Time
- **date-fns** for date manipulation and formatting

## Session Management
- **connect-pg-simple** for PostgreSQL session storage

## Additional UI Libraries
- **cmdk** for command palette functionality
- **embla-carousel-react** for image carousels and sliders