# Garage

Next.js app for **ShopGarage listing invoices**: generate a PDF from a listing URL or UUID, download it in the browser, or email it as an attachment (via [Resend](https://resend.com)).

## Requirements

- Node.js 18+

## Scripts

| Command | Description |
|--------|-------------|
| `npm install` | Install dependencies |
| `npm run start` | Dev server (`next dev`) |
| `npm run build` | Production build |
| `npm run start:prod` | Run production build (`next start`) |

## HTTP API

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/invoice` | JSON body `{ "listingUrl": "<url or uuid>" }` → PDF stream |
| `POST` | `/api/invoice/email` | JSON body `{ "listingUrl": "...", "to": "..." }` → sends email with PDF |

Listing data is loaded from the Garage backend (`listingService` default base URL in code).

## Project layout

```
app/
  api/invoice/          # Route handlers (thin): parse body, call services, return Response
  lib/                  # Shared helpers (e.g. UUID parsing, email validation)
  lib/invoice/
    formatCurrency.ts   # Shared formatting (used by the PDF doc)
    backend/
      InvoicePdfDocument.tsx   # @react-pdf document (`import "server-only"`)
  services/
    backend/            # Server-only: listing fetch + PDF pipeline, generic email send
    frontend/           # `"use client"` modules: fetch wrappers + browser download UX
  types/                # e.g. GarageListing
  uiKit/                # Buttons, fields, alerts
  page.tsx              # Home UI
```

**Convention:** put anything that must never run in the browser under `services/backend/` (and use `import "server-only"` where it helps). Put `fetch` + DOM helpers used from Client Components under `services/frontend/`.

## Configuration

Email delivery uses Resend from `app/services/backend/emailService.ts`. For a real deployment, move the API key and sender address into environment variables instead of committing secrets.
