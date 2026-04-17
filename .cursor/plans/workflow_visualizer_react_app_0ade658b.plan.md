---
name: Workflow Visualizer React App
overview: Convert the index.html mockup into a Next.js App Router application with two pages (WorkflowPage / AgentPage), reusable uiKit components (Header, Table), TypeScript types for workflow.json, and an npm script to load workflow files.
todos:
  - id: scripts
    content: Add scripts/load-workflow.sh and update package.json scripts
    status: completed
  - id: types
    content: Create app/types/workflow.ts with Workflow, Agent, Subagent types
    status: completed
  - id: lib
    content: Create app/lib/workflow.ts with getWorkflow(), slugify(), findAgentBySlug()
    status: completed
  - id: uikit-header
    content: Create app/uiKit/Header.tsx component
    status: completed
  - id: uikit-table
    content: Create app/uiKit/Table.tsx component
    status: completed
  - id: layout-theme
    content: Update layout.tsx and globals.css to light theme matching mockup
    status: completed
  - id: workflow-page
    content: Rewrite app/page.tsx as WorkflowPage with Header + Table
    status: completed
  - id: agent-page
    content: Create app/agent/[slug]/page.tsx as AgentPage with connection matrices
    status: completed
  - id: verify
    content: Run npm build to verify everything compiles
    status: completed
isProject: false
---

# Workflow Visualizer React App

## 1. npm scripts ([package.json](package.json))

Add a `load-workflow` script that copies a given JSON file into `public/workflow.json`:

```json
"scripts": {
  "load-workflow": "cp \"$1\" public/workflow.json",
  "start": "npm run load-workflow -- public/workflow.json && next dev",
  "build": "next build",
  "start:prod": "next start"
}
```

Because npm scripts don't forward positional args cleanly, we will use a tiny shell helper `scripts/load-workflow.sh`:

```bash
#!/usr/bin/env bash
cp "$1" public/workflow.json
```

- `"load-workflow": "bash scripts/load-workflow.sh"` -- standalone usage: `npm run load-workflow -- path/to/file.json`
- `"start"` calls `load-workflow` with `public/workflow.json` (no-op copy to self, effectively a passthrough) then `next dev`

This means the user flow is:

1. `npm run load-workflow -- ~/my-workflow.json` (optional, to swap in a different file)
2. `npm run start` (always serves from `public/workflow.json`)

## 2. TypeScript types ([app/types/workflow.ts](app/types/workflow.ts))

Derived from the JSON shape:

- `**Workflow**` -- top-level: `_id`, `workflowName`, `_v`, `description`, `content`, `agents: Agent[]`
- `**Agent**` -- `title`, `description`, `_v`, `instructions`, `subagents: Subagent[]`, `inputData: string[]`, `publicData: boolean`, `votingRounds: number`, `nonAIGeneration: boolean`, `dataSources: Record<string, unknown>`, `status?: string`
- `**Subagent**` -- same shape as Agent minus `subagents` and `status`

## 3. uiKit components ([app/uiKit/](app/uiKit/))

### `Header` ([app/uiKit/Header.tsx](app/uiKit/Header.tsx))

Props: `title: string`, `description?: string`, `instructions?: string`

- Renders an `<h1>` with the title
- Renders the description as a muted paragraph
- Renders the instructions as a numbered `<ol>` (each `\n`-separated line becomes a list item), replicating the `flowNumberedList` logic from the mockup

### `Table` ([app/uiKit/Table.tsx](app/uiKit/Table.tsx))

Props: `headerNames: string[]`, `data: Record<string, React.ReactNode>[]`

- Renders an HTML `<table>` styled with Tailwind
- `<thead>` row built from `headerNames`
- `<tbody>` rows built by iterating `data`, pulling each `headerName` key from each row object
- Inspired by the MUI BasicTable example (but pure Tailwind, no MUI dependency)

## 4. Data fetching utility ([app/lib/workflow.ts](app/lib/workflow.ts))

- A helper `getWorkflow()` that reads and parses `public/workflow.json` from the filesystem at build/request time (using `fs.readFileSync` in a server component context)
- A helper `slugify(title: string)` to produce URL-safe slugs from agent titles
- A helper `findAgentBySlug(agents, slug)` to look up agents

## 5. Pages

### WorkflowPage ([app/page.tsx](app/page.tsx))

The root `/` page. Server component that:

1. Calls `getWorkflow()`
2. Renders `<Header title={workflow.workflowName} description={workflow.description} instructions={workflow.content} />`
3. Renders `<Table>` with columns `["Agent", "Subagents"]`, where:

- The "Agent" column is a `<Link>` to `/agent/[slug]`
- The "Subagents" column shows a grid of subagent titles (replicating the mockup's subagent-grid)

### AgentPage ([app/agent/[slug]/page.tsx](app/agent/[slug]/page.tsx))

Dynamic route. Server component that:

1. Calls `getWorkflow()`, finds the agent by slug
2. Renders a back link to `/`
3. Renders `<Header title={agent.title} description={agent.description} instructions={agent.instructions} />`
4. Builds two connection matrices (replicating `collectInputs` logic):

- **Database Connections** -- inputs containing `_` (sorted)
- **Subagent Connections** -- inputs without `_` (sorted), with self-cells dimmed

1. Renders each matrix as a `<Table>` with sticky first column, subagent rows, and "X" marks for connections

### Shared layout ([app/layout.tsx](app/layout.tsx))

Both pages already share the existing root layout. We keep the current dark theme on `<body>` but make it light-themed to match the mockup's `--bg: #f4f5f7` style. Both pages use the same `<Header>` and `<Table>` components.

## 6. File structure summary

```
scripts/load-workflow.sh
app/
  types/
    workflow.ts
  lib/
    workflow.ts
  uiKit/
    Header.tsx
    Table.tsx
  layout.tsx          (updated: light theme)
  globals.css         (updated: light theme base styles)
  page.tsx            (WorkflowPage)
  agent/
    [slug]/
      page.tsx        (AgentPage)
```
