# React Dashboard Project

A modern, production-ready React dashboard application built with TypeScript, Vite, and Tailwind CSS. Features a complete dashboard layout with navigation, routing, theme switching, and a scalable project structure.

## Features

- ⚡️ **Vite** - Lightning-fast development with HMR
- ⚛️ **React 19** - Latest React with React Compiler enabled
- 🎨 **Tailwind CSS 4** - Modern utility-first CSS framework
- 💎 **TypeScript** - Type-safe development
- 🎭 **SCSS Modules** - Component-scoped styling with Sass
- 🔄 **React Router v7** - Client-side routing with protected routes
- 🌓 **Dark Mode** - System-aware theme switching
- 📱 **Responsive Design** - Mobile-first dashboard layout
- 🎯 **Lucide Icons** - Beautiful, consistent icon set
- 🏗️ **Scalable Architecture** - Well-organized project structure

## Project Structure

```
src/
├── assets/          # Static assets and global styles
├── components/      # Reusable UI components (Sidebar, TopNav)
├── config/          # Application configuration
├── constants/       # App-wide constants
├── contexts/        # React contexts (ThemeContext)
├── hoc/            # Higher-order components (withAuth)
├── hooks/          # Custom React hooks (useLocalStorage)
├── layouts/        # Layout components (DashboardLayout)
├── pages/          # Page components (Dashboard, Products, Orders, etc.)
├── routes/         # Route definitions
├── services/       # API services
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Tech Stack

- **React 19** with React Compiler for optimized performance
- **TypeScript** for type safety
- **Vite** for fast builds and HMR
- **Tailwind CSS 4** for styling
- **Sass** for advanced styling with CSS Modules
- **React Router v7** for routing
- **Lucide React** for icons
- **ESLint** for code quality

## React Compiler

The React Compiler is enabled on this project. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This may impact Vite dev & build performance but provides runtime optimizations.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
