# Support KB Editor & Playground

A knowledge base editor and testing playground for a support bot built with Next.js 15, TypeScript, Tailwind, shadcn/ui, Vercel AI SDK, and OpenRouter.

## Features

- **Playground** (`/`) - Test the support bot with a chat interface
  - Model selector (Claude 3.5 Haiku, GPT-4o Mini, Claude 3.5 Sonnet)
  - Real-time streaming responses
  - KB-powered answers

- **KB Editor** (`/kb`) - Manage knowledge base entries
  - View all entries in a table
  - Filter by category (access, technical, payments)
  - Add, edit, and delete entries
  - File-based storage (no database required)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your OpenRouter API key to `.env`:
```
OPENROUTER_API_KEY=your_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Structure

- `src/kb/` - Knowledge base files
  - `system-prompt.md` - System prompt for the bot
  - `global/*.json` - KB entries by category
  - `index.ts` - Loads and exports KB entries

- `src/app/api/chat/route.ts` - Streaming chat API
- `src/app/api/kb/route.ts` - KB management API
- `src/app/page.tsx` - Playground page
- `src/app/kb/page.tsx` - KB editor page

## KB Entry Format

Each entry in the JSON files has:
- `id` - Unique identifier
- `triggers` - Array of Russian phrases that trigger this answer
- `answer` - The response to send
- `followup` (optional) - Additional follow-up text
- `escalate` (optional) - Whether to escalate to human support

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Vercel AI SDK
- OpenRouter (for LLM access)
