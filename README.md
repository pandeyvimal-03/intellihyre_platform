# IntelliHire Platform

React-based recruitment dashboard and interview interface.

## 🚀 Getting Started

### Prerequisites

- [pnpm](https://pnpm.io/)
- Node.js 18+

### Development

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Start the development server:
   ```bash
   pnpm dev
   ```

### Production Build

```bash
pnpm build
```

## 🏗 Tech Stack

- **React 18:** UI Library.
- **Vite:** Build tool.
- **Tailwind CSS:** Styling.
- **shadcn/ui:** Component library.
- **TanStack Query:** Data fetching.
- **Zustand:** State management.
- **face-api.js:** Local proctoring analysis.

## 📂 Structure

- `src/components/`: Reusable UI components.
- `src/hooks/`: Custom React hooks (Proctoring, WebSockets).
- `src/pages/`: Main views (Candidate & Recruiter).
- `src/services/`: API client services.
- `src/store/`: Auth and global state.
