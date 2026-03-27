---
description: How to maintain and develop the BigSuno V2 Architecture
---

# BigSuno V2 Architecture Workflow

This workflow summarizes the standards for developing the BigSuno V2 platform.

## 1. Directory Structure
- Always use unified routes: `/home`, `/history`, `/wallet`, `/me`, `/p/[id]`.
- Keep shared components in `src/components/ui/` (using Shadcn/Common).
- Business logic for calls and payments must reside in `src/hooks/useCall.ts` or `src/lib/payments.ts`.

## 2. Premium UI/UX Standards
- **Aesthetics**: Use glassmorphism, gradients, and soft shadows.
- **Animations**: Use `tw-animate-css` for micro-interactions (hover, load, transition).
- **Typography**: Stick to the Outfit/Inter font pairing.
- **Dark Mode**: Prioritize a sleek, premium dark mode with Deep Purple accents.

## 3. Financial Workflow
- **Commission**: 10% platform fee is mandatory for all Provider earners.
- **Hybrid Payment**:
    1. Check `user.creditBalance`.
    2. If insufficient, trigger the PayU sliding modal for the difference.
    3. Finalize transaction before call connection.

## 4. Deployment
- Deploy via Vercel for stateless function handling.
- Use `vercel env pull` to sync environment variables locally.
- Ensure `isAvailable` toggle in Firestore is handled atomically.
