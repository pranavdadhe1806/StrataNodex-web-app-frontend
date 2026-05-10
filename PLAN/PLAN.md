# StrataNodex Web App — PLAN.md

> **Single source of truth for architecture, design system, screens, and component breakdown.**  
> Every AI agent working on this repo must read this file before touching any code.

---

## 1. Project Context

StrataNodex is a **CLI-first, cross-platform productivity and task management system** where everything is a **Node** and nodes nest infinitely. The web app is one of four clients — CLI (done), Web (this repo), Mobile (future), Desktop (future) — all talking to a shared Express + PostgreSQL backend over REST.

### Polyrepo Structure

```
stratanodex-web-app-frontend/   ← THIS REPO
stratanodex-backend/            ← separate repo, live on Render
stratanodex-cli/                ← separate repo, published on npm
stratanodex-landing-page/       ← separate repo, live on Vercel
```

This repo is **NOT** a monorepo. No shared packages. All TypeScript types live locally in `src/types/`. The only inter-repo communication is HTTP.

### Auth Flow (Important)

The web app does **NOT** have its own login/register pages. Authentication is handled entirely by the landing page (`https://stratanodex-landing-page.vercel.app/#auth`). 

Flow:
1. User visits web app → if no JWT in localStorage → redirect to landing page auth
2. User logs in / registers on landing page → JWT saved to localStorage → redirected back to web app dashboard
3. Web app reads JWT from localStorage on load → calls `GET /auth/me` → populates user state
4. Profile menu in web app has "Logout" → clears localStorage → redirects to landing page auth

The landing page already has a "Dashboard" link in its profile section which links to this web app.

---

## 2. Data Hierarchy

```
User Account
 └── Folders          (e.g. "Work", "Personal", "GATE")
      └── Lists        (e.g. "Maths", "Science", "Daily Tasks")
           └── Nodes   (Tasks — the actual work items)
                └── Sub-nodes (infinite depth via parentId)
```

### Node Fields

| Field | Type | Notes |
|---|---|---|
| `id` | string | cuid |
| `title` | string | |
| `status` | `TODO` \| `IN_PROGRESS` \| `DONE` | |
| `priority` | `LOW` \| `MEDIUM` \| `HIGH` | optional |
| `notes` | string \| null | plain text, scrollable in UI |
| `startAt` | datetime \| null | |
| `endAt` | datetime \| null | |
| `reminderAt` | datetime \| null | |
| `canvasX` | float \| null | position on canvas |
| `canvasY` | float \| null | position on canvas |
| `position` | int | sibling ordering |
| `listId` | string | owning list |
| `parentId` | string \| null | null = root node |
| `tags` | `Tag[]` | |
| `children` | `Node[]` | recursive |

### Tag Scoping
- **Global tags** — `listId = null` — available across all lists
- **Local tags** — `listId = set` — scoped to one list

---

## 3. Gamification

Daily score computed per list and overall account at end of each day:

```
≥ 90% tasks done  →  +3 points
  60–89%          →  +2 points
  30–59%          →  +1 point
   1–29%          →   0 points
     0%           →  -1 point
```

Streaks tracked at account level, list level, and folder level.

---

## 4. Tech Stack

| Concern | Technology |
|---|---|
| Framework | React 18 |
| Build tool | Vite |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| UI state | Zustand |
| Server state / caching | TanStack React Query v5 |
| HTTP client | Axios |
| Routing | React Router v6 |
| Icons | Lucide React |
| Dates | date-fns |
| Charts | Recharts |
| Canvas drag | @use-gesture/react |
| Font | Poppins (Google Fonts) |
| Deployment | Vercel |

---

## 5. Design System

### Philosophy
**Minimal dark glassmorphism.** Every surface feels like frosted dark glass — premium, depth-layered, never flat. The UI is greyish-dark with subtle glass borders and shadows that make elements pop. No loud colors except for status indicators. No purple ever.

### Color Tokens

```css
/* Backgrounds */
--bg-base: #1B1D21;          /* page background */
--bg-node: #32363C;          /* node cards, popups, menus */
--bg-overlay: rgba(27, 29, 33, 0.85); /* modal backdrop */

/* Text */
--text-primary: #EDEFF3;     /* topbar, focused node text, headings */
--text-secondary: #D5D8DE;   /* unfocused node text, body */
--text-muted: #8A8F98;       /* completed tasks, subtitles, placeholders */
--text-placeholder: #7D828B; /* canvas placeholder */

/* Borders & Connectors */
--border-glass: rgba(255, 255, 255, 0.08);   /* default glass border */
--border-glass-bright: rgba(255, 255, 255, 0.15); /* hover/focus glass border */
--connector-color: #8B92A1;  /* tree connector lines/arrows */

/* Status Colors */
--status-todo: #8A8F98;      /* circle outline */
--status-in-progress: #00bfff; /* cyan — consistent with brand */
--status-done: #00c896;      /* teal — consistent with brand */
--status-overdue: #f85149;   /* red */

/* Priority */
--priority-low: #3fb950;
--priority-medium: #d29922;
--priority-high: #f85149;

/* Accent */
--accent-cyan: #00bfff;
--accent-teal: #00c896;
```

### Glass Effect (applied to nodes, cards, popups, menus)

```css
background: #32363C;
border: 1px solid rgba(255, 255, 255, 0.08);
box-shadow:
  0 4px 24px rgba(0, 0, 0, 0.4),
  inset 0 1px 0 rgba(255, 255, 255, 0.06);
border-radius: 12px;
backdrop-filter: blur(8px);
```

### Shadow (to lift elements off canvas)

```css
/* Node cards */
box-shadow:
  0 2px 8px rgba(0, 0, 0, 0.35),
  0 0 0 1px rgba(255, 255, 255, 0.06),
  inset 0 1px 0 rgba(255, 255, 255, 0.06);

/* Focused node — slightly more prominent */
box-shadow:
  0 4px 16px rgba(0, 0, 0, 0.5),
  0 0 0 1px rgba(255, 255, 255, 0.12),
  inset 0 1px 0 rgba(255, 255, 255, 0.08);
```

### Typography

```css
font-family: 'Poppins', sans-serif;

/* Scale */
--text-xs: 11px;
--text-sm: 13px;
--text-base: 15px;
--text-lg: 17px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 30px;
```

### Connector Lines (tree arrows)

- Color: `#8B92A1`
- Drop shadow: `filter: drop-shadow(0 1px 3px rgba(0,0,0,0.5))`
- Shape: L-shaped — vertical down from parent, then horizontal right to child
- Arrow head at child end
- SVG rendered behind node cards (z-index lower than cards)

---

## 6. Screens

### Screen 1 — Dashboard (Home)

Landing screen after login. Shows account-level productivity overview.

**Layout:**
- Full page, same `#1B1D21` background
- Topbar: hamburger (left) → "Dashboard" centered → profile icon (right)
- Content split into sections:

**Top row — Stat cards (3 cards side by side):**
Each card has glass effect + shadow. Cards:
1. **Streak** — flame icon + current streak number (e.g. "7 days") + subtext "Current Streak"
2. **Today's Score** — points number + subtext "Points Today" + small indicator (e.g. +2)
3. **Total Score** — cumulative points + subtext "All Time Points"

**Middle — Main Graph:**
- Recharts LineChart, X = last 14 days (dates), Y = daily points
- Line color: `#00bfff` (cyan)
- Grid lines: `rgba(255,255,255,0.05)`
- Dot on line: filled cyan
- Axes text: `#7D828B`
- Same glass card wrapper

**Bottom row — Per-list breakdown:**
- Each active list shown as a row:
  ```
  Maths        ████████░░  8/10   +2
  Science      ███░░░░░░░  3/5    +1
  ─────────────────────────────────────
  Overall      ███████░░░  11/15  +2 today
  ```
- Progress bar: filled `#00bfff`, track `rgba(255,255,255,0.08)`
- Glass card wrapper

---

### Screen 2 — Your Folders

Grid of folder cards. User lands here when clicking "Your Folders" from hamburger menu.

**Layout:**
- Topbar: hamburger → "Your Folders" centered → profile icon
- Content: responsive grid of folder cards (3–4 per row on desktop)
- Bottom-right floating button: `+` to create new folder

**Folder Card:**
- Glass effect + shadow (same as nodes)
- Folder icon (Lucide `Folder` icon) in `#00bfff` cyan, larger size (~32px)
- Folder name below icon in `#EDEFF3`
- Subtext: list count (e.g. "4 lists") in `#7D828B`
- Hover: border brightens to `rgba(255,255,255,0.15)`, slight scale-up (1.02)
- Click: navigates to folder's lists screen

**Empty state:**
- Centered illustration (simple SVG folder icon, muted) + text "No folders yet" + "Create your first folder" button

---

### Screen 3 — Folder (Lists inside a folder)

Shows all lists inside a selected folder.

**Layout:**
- Topbar: hamburger → folder name centered → profile icon
- Content: responsive grid of list cards (same layout as folders grid)
- Breadcrumb below topbar: `Your Folders > [Folder Name]`
- Bottom-right floating `+` button to create new list

**List Card:**
- Same glass card design as folder cards
- List icon (Lucide `List` icon) in `#00c896` teal
- List name in `#EDEFF3`
- Subtext: node count + completion (e.g. "12 tasks · 4 done") in `#7D828B`
- Streak badge if list has active streak: small flame icon + number
- Click: navigates to list canvas

---

### Screen 4 — List Canvas (CORE SCREEN)

The pannable canvas for working with nodes in a list.

**Layout:**
- Topbar: hamburger (left) → list name centered (double-click to rename inline) → profile icon (right)
- Full screen canvas below topbar, `#1B1D21` background
- Floating progress widget: fixed position top-right (doesn't pan with canvas)
- Canvas content pans freely

**Empty state:**
- Placeholder text "You can start typing here...." in `#7D828B`, centered-left
- Double-click anywhere on canvas → text cursor appears → user types → Enter confirms node → Tab indents as subtask

**Floating Progress Widget:**
- Glass card, fixed position (top-right, below topbar)
- "Total Progress:" label in `#D5D8DE`
- Progress bar: filled `#00bfff`, track `rgba(255,255,255,0.08)`, percentage shown
- "Total Task Completed: X/Y" in `#8A8F98`

**Node Card — 3 States:**

*Focused (currently selected/active):*
```
bg: #32363C
border: 1px solid rgba(255,255,255,0.15)  ← brighter
shadow: 0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)
text: #EDEFF3
circle: #8A8F98 outline
```

*Unfocused (exists but not selected):*
```
bg: #32363C
border: 1px solid rgba(255,255,255,0.08)  ← dimmer
shadow: 0 2px 8px rgba(0,0,0,0.35)
text: #D5D8DE
circle: #8A8F98 outline
```

*Completed:*
```
bg: #32363C (slightly more transparent)
border: 1px solid rgba(255,255,255,0.05)
text: #8A8F98 with line-through
circle: filled/checked (no outline)
```

**Node Anatomy:**
```
┌──────────────────────────────────────────┐
│  ○  Main Task - 1                        │
└──────────────────────────────────────────┘
```
- Left: status circle (click = toggle complete)
- Text: task title (click = open Node Properties popup)
- Rounded corners: 12px
- Min-width: 180px, adjusts to content

**Tree Connectors:**
- L-shaped SVG lines: vertical down from parent bottom-center, then horizontal right to child left-center
- Arrow head at child end
- Color: `#8B92A1`, drop-shadow for depth
- Z-index: below node cards

**Hierarchical Numbering:**
- Computed at render time, never stored
- Root nodes: 1, 2, 3
- Children: 1.1, 1.2, 1.2.1 etc.
- Shown as prefix in node title display

**Node Properties Popup:**
- Triggered by clicking node text (not circle)
- Full-screen semi-transparent backdrop: `rgba(27,29,33,0.85)`
- Popup card: same glass effect as nodes, `#32363C` bg, border-radius 16px
- Fixed height popup, only Notes section scrolls internally
- Fields:
  - Title (editable text input at top)
  - Status dropdown: `TODO / IN_PROGRESS / DONE`
  - Priority dropdown: `LOW / MEDIUM / HIGH`
  - Start Date + Start Time (side by side)
  - End Date + End Time (side by side)
  - Tags: pill display + `+ add tag` input
  - Notes: scrollable textarea
  - Bottom buttons: `Add Sub-task` | `Delete Node`
- Close: `×` button top-right, or click backdrop

**Hamburger Menu (More Options):**
- Opens left-side drawer or dropdown (same glass style)
- Options:
  - Dashboard
  - Your Folders
  - Open Current Folder (dynamic label: "Open [FolderName]")
  - Rename List
  - Delete List
  - ─────
  - Settings

**Profile Menu:**
- Opens dropdown from top-right icon (same glass style)
- Shows: Name (primary text) + @username (muted subtext)
- Divider
- Options: Profile Settings, Settings, Logout

---

### Screen 5 — Daily Tasks

Shows all tasks due today across all lists.

**Layout:**
- Topbar: hamburger → "Today" centered → profile icon
- Grouped by list name (collapsible sections)
- Each task row: same node card style (smaller, list-style not canvas)
- Right column: DailyBreakdown widget (same as dashboard bottom row)

---

### Screen 6 — Stats

Full analytics screen.

**Layout:**
- Topbar: hamburger → "Stats" centered → profile icon
- Streak row: 3 streak badges (account, top list, top folder) with flame icons
- Main graph: large Recharts LineChart (last 30 days)
- Per-list score cards: grid of cards, each showing list name + last 7 days mini-graph + current streak

---

## 7. Sidebar / Hamburger Menu

The hamburger (☰) on all screens opens the **same consistent menu**. This is NOT a persistent sidebar — it's an overlay panel that slides in from the left.

**Panel design:** Glass effect, `#32363C` bg, full height, ~280px wide, slides in from left.

**Contents:**
```
[StrataNodex logo/wordmark]
─────────────────────────────
  🏠  Dashboard
  📁  Your Folders
  📅  Today
  📊  Stats
─────────────────────────────
  [Current context section]
  If on a list screen:
    📂  Open [FolderName]
    ✏️  Rename List
    🗑️  Delete List
─────────────────────────────
  ⚙️  Settings
```

Close: click outside panel or press Esc.

---

## 8. Architecture — Separation of Concerns

```
src/api/        → ALL HTTP calls. Axios only. Never called directly from components.
src/hooks/      → React Query wrappers. Own all server state.
src/store/      → Zustand. UI state ONLY (canvas pan/zoom, sidebar open, selected node).
                  Never stores API response data.
src/types/      → All TypeScript interfaces. Local only, no shared package.
src/utils/      → Pure helpers (token, tree, numbering, scoring).
src/components/ → UI components grouped by domain.
src/pages/      → Route-level screens.
```

**React Query** = server cache (folders, lists, nodes, scores)  
**Zustand** = UI state (canvas panX/panY/zoom, sidebar open, selected node ID, detail panel open)

These two **never overlap**.

---

## 9. Routes

```
/                    → redirect to /dashboard (if authed) or landing page (if not)
/dashboard           → Dashboard / Home screen
/folders             → Your Folders grid
/folders/:folderId   → Lists inside a folder
/list/:listId        → List canvas (CORE)
/daily               → Today's tasks
/stats               → Stats + graphs
```

No `/login` or `/register` routes — auth lives on the landing page.

---

## 10. Zustand Stores

### `auth.store.ts`
```ts
interface AuthStore {
  token: string | null
  user: User | null
  setToken: (token: string) => void
  setUser: (user: User) => void
  logout: () => void  // clears localStorage, redirects to landing page auth
}
```

### `canvas.store.ts`
```ts
interface CanvasStore {
  panX: number
  panY: number
  zoom: number
  selectedNodeId: string | null
  expandedNodes: Set<string>
  setPan: (x: number, y: number) => void
  setZoom: (zoom: number) => void
  selectNode: (id: string | null) => void
  toggleExpand: (id: string) => void
}
```

### `ui.store.ts`
```ts
interface UIStore {
  sidebarOpen: boolean
  detailPanelOpen: boolean
  activeListId: string | null       // for hamburger "Open current folder"
  activeFolderId: string | null
  toggleSidebar: () => void
  openDetailPanel: () => void
  closeDetailPanel: () => void
  setActiveContext: (listId: string, folderId: string) => void
}
```

---

## 11. API Contract

Base URL: `VITE_API_URL` (env var)  
All authenticated requests: `Authorization: Bearer <jwt>`  
JWT stored in localStorage under key: `stratanodex_token`

| Method | Path | Purpose |
|---|---|---|
| GET | `/auth/me` | Current user |
| GET | `/folders` | All folders |
| POST | `/folders` | Create folder |
| PATCH | `/folders/:id` | Rename folder |
| DELETE | `/folders/:id` | Delete folder |
| GET | `/folders/:folderId/lists` | Lists in folder |
| POST | `/lists` | Create list |
| PATCH | `/lists/:id` | Rename list |
| DELETE | `/lists/:id` | Delete list |
| GET | `/lists/:listId/tree` | Full node tree |
| POST | `/nodes` | Create node |
| PATCH | `/nodes/:id` | Update node |
| DELETE | `/nodes/:id` | Delete node |
| POST | `/nodes/:id/move` | Move node |
| GET | `/tags` | All tags |
| POST | `/tags` | Create tag |
| POST | `/nodes/:id/tags/:tagId` | Attach tag |
| DELETE | `/nodes/:id/tags/:tagId` | Detach tag |
| GET | `/daily/today` | Today's tasks |
| GET | `/daily/overdue` | Overdue tasks |
| GET | `/scores` | Score history |
| GET | `/scores/streak` | Streak data |

On 401 → axios interceptor clears token → redirects to `https://stratanodex-landing-page.vercel.app/#auth`

---

## 12. File Structure

```
stratanodex-web-app-frontend/
│
├── public/
│   └── favicon.ico
│
├── src/
│   ├── main.tsx
│   ├── App.tsx                         # Router + QueryClientProvider + AuthGuard
│   ├── vite-env.d.ts
│   │
│   ├── types/
│   │   ├── node.types.ts
│   │   ├── folder.types.ts
│   │   ├── list.types.ts
│   │   ├── tag.types.ts
│   │   ├── auth.types.ts
│   │   └── score.types.ts
│   │
│   ├── api/
│   │   ├── client.ts                   # Axios instance + interceptors
│   │   ├── auth.api.ts
│   │   ├── folder.api.ts
│   │   ├── list.api.ts
│   │   ├── node.api.ts
│   │   ├── tag.api.ts
│   │   ├── daily.api.ts
│   │   └── score.api.ts
│   │
│   ├── store/
│   │   ├── auth.store.ts
│   │   ├── canvas.store.ts
│   │   └── ui.store.ts
│   │
│   ├── hooks/
│   │   ├── useFolders.ts
│   │   ├── useLists.ts
│   │   ├── useTree.ts
│   │   ├── useDailyTasks.ts
│   │   ├── useScores.ts
│   │   └── useTags.ts
│   │
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── FoldersPage.tsx
│   │   ├── FolderPage.tsx
│   │   ├── ListPage.tsx                # Canvas — CORE PAGE
│   │   ├── DailyPage.tsx
│   │   └── StatsPage.tsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Topbar.tsx              # hamburger + title + profile icon
│   │   │   ├── SidePanel.tsx           # slide-in left panel (hamburger menu)
│   │   │   ├── ProfileMenu.tsx         # dropdown from profile icon
│   │   │   └── AuthGuard.tsx           # redirects to landing if no token
│   │   │
│   │   ├── canvas/
│   │   │   ├── Canvas.tsx              # pan + zoom container
│   │   │   ├── NodeCard.tsx            # single node card (3 states)
│   │   │   ├── NodeConnector.tsx       # SVG L-shaped connector + arrow
│   │   │   ├── NodeTree.tsx            # recursive renderer
│   │   │   ├── NodeDetailPanel.tsx     # popup for node properties
│   │   │   ├── ProgressWidget.tsx      # floating progress card
│   │   │   └── InlineNodeInput.tsx     # typing new node on canvas
│   │   │
│   │   ├── folders/
│   │   │   ├── FolderCard.tsx
│   │   │   └── FolderModal.tsx         # create/rename modal
│   │   │
│   │   ├── lists/
│   │   │   ├── ListCard.tsx
│   │   │   └── ListModal.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── StatCard.tsx            # streak / score / total cards
│   │   │   ├── MainGraph.tsx           # recharts line graph
│   │   │   └── DailyBreakdown.tsx      # per-list progress bars
│   │   │
│   │   ├── daily/
│   │   │   ├── DailyTaskItem.tsx
│   │   │   └── OverdueTaskItem.tsx
│   │   │
│   │   ├── stats/
│   │   │   ├── StreakBadge.tsx
│   │   │   └── ListScoreCard.tsx
│   │   │
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Badge.tsx               # status + priority badges
│   │       ├── ProgressBar.tsx
│   │       ├── Spinner.tsx
│   │       └── GlassCard.tsx           # reusable glass wrapper
│   │
│   └── utils/
│       ├── token.ts                    # getToken, setToken, clearToken
│       ├── tree.ts                     # flattenTree, buildTree, findNode
│       ├── numbering.ts                # compute 1.2.1 numbering at render
│       └── scoring.ts                  # points tier logic
│
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 13. Implementation Phases

### Phase 1 — Foundation
- Scaffold: Vite + React + TS + Tailwind + Poppins
- React Router with all routes
- Axios client with JWT interceptor + 401 redirect to landing page
- Zustand stores (auth, canvas, ui)
- AuthGuard (redirect to landing if no token)
- Topbar + SidePanel + ProfileMenu (layout shell)
- GlassCard reusable component
- All page stubs

### Phase 2 — Folders + Lists
- FoldersPage: grid of FolderCards, create/rename/delete
- FolderPage: grid of ListCards inside folder, create/rename/delete
- React Query hooks for folders and lists
- FolderModal + ListModal

### Phase 3 — Canvas Tree (Core)
- Canvas component with pan + zoom + drag background
- NodeCard (3 states), NodeConnector (SVG L-shaped)
- NodeTree recursive renderer with computed numbering
- ProgressWidget (floating, fixed position)
- InlineNodeInput (double-click canvas to type)
- NodeDetailPanel popup (all fields, scrollable notes)
- Node CRUD + status cycle + tag attach/detach
- canvas.store wired (panX, panY, zoom, selectedNodeId, expandedNodes)

### Phase 4 — Dashboard + Daily + Stats
- DashboardPage: StatCards + MainGraph + DailyBreakdown
- DailyPage: task list grouped by list, with breakdown
- StatsPage: large graph + streak badges + per-list cards
- React Query hooks for scores + daily tasks

### Phase 5 — Polish + Deploy
- Loading skeletons for all pages
- Empty states for folders, lists, canvas
- Error states with retry
- Responsive (sidebar collapses on mobile)
- Vercel deployment with `VITE_API_URL` set to Render backend

---

## 14. Hard Rules — Never Break These

1. **No direct DB access** — only HTTP via `src/api/`
2. **No types imported from outside this repo** — all in `src/types/`
3. **React Query for server state, Zustand for UI state** — never mix
4. **All axios calls go through `src/api/client.ts`** — never import axios directly in components
5. **JWT in localStorage only** under key `stratanodex_token` — no cookies
6. **Hierarchical numbering never stored** — computed at render in `src/utils/numbering.ts`
7. **canvasX/canvasY always nullable** — always have a fallback layout
8. **Never mutate Zustand state directly** — use store actions
9. **No purple anywhere** — ever
10. **401 from backend** → clear token → redirect to `https://stratanodex-landing-page.vercel.app/#auth`
11. **No login/register pages in this repo** — auth is on the landing page
12. **Floating ProgressWidget never pans** — it is `position: fixed` relative to viewport
