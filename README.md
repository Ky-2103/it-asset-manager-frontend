# IT Asset & Maintenance Management Frontend (Prototype)

A clean, modern React + TypeScript frontend scaffold for your IT Asset & Maintenance Management System.

## Project structure

```txt
src/
  components/
    FlashMessage.tsx
    StatCard.tsx
    TopNav.tsx
  data/
    seed.ts
  hooks/
    useRoute.ts
  pages/
    LandingPage.tsx
    LoginPage.tsx
    RegisterPage.tsx
    DashboardPage.tsx
    AssetsPage.tsx
    TicketsPage.tsx
    UsersPage.tsx
  types/
    models.ts
  App.tsx
```

## What this frontend includes

- Landing page
- Login + Register pages with validation + flash messages
- Role-based dashboards (Admin and Regular User)
- Role-aware top navigation
- Assets page (admin manage / user view)
- Tickets page (admin manage / user create and view)
- Users page (admin only)
- Mock seed data for users/assets/tickets (no backend required yet)

## Demo users

Use any password with 6+ characters:

- `admin`
- `jane.doe`
- `john.smith`
- `sam.patel`

## Run locally

```bash
npm install
npm run dev
```

## Backend integration (later)

Replace these handlers in `src/App.tsx` with real API calls when your backend is ready:

- `handleLogin`
- `handleRegister`
- `addAsset`
- `deleteAsset`
- `handleCreateTicket`
- `updateTicketStatus`
