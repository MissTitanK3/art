# 🗺️ Contributing Guide for `apps/region-template`

Welcome! This is the **Region Template app**. It provides a working example of how to combine:

- Shared UI components from `@workspace/ui`  
- Shared state from `@workspace/store`  
- Region-specific configuration (DB adapters, routes, auth)  

This app is the baseline you can **copy and adapt for a new region**.  

---

## 🎯 Purpose

- Demonstrate how to wire together UI + stores in a real app.  
- Act as a **blueprint** for quickly launching new region deployments.  
- Keep logic modular so regions can swap backends (Supabase, PocketServer, demo DB).  
- Provide working routes like `/my-profile` and `/dispatches` that showcase patterns.  

---

## 📂 Folder Structure

apps/region-template/  
  app/ – Next.js routes (e.g. `/my-profile`, `/dispatches`)  
  lib/ – Region-specific helpers (adapters, utils)  
  public/ – Static assets  
  tsconfig.json – Local config for this app  
CONTRIBUTING.md – This file  

---

## 📐 Conventions

1. **Keep region logic here**  
   - Use `@workspace/store` for shared state.  
   - Use `@workspace/ui` for components.  
   - Any DB or API adapters should live in `apps/region-template/lib/`.  

2. **Separation of concerns**  
   - `@workspace/store` = business logic & state  
   - `@workspace/ui` = reusable presentation components  
   - `apps/region-template` = glue code + region-specific DB/backend  

3. **Routes**  
   - Each route should be self-contained in `app/`.  
   - Client-side state (`useProfileStore`, etc.) must only be accessed inside `"use client"` components.  

4. **DB adapters**  
   - Default demo uses local Zustand persistence.  
   - Replace or extend with Supabase, PocketServer, or other backends for production.  
   - Keep adapters in `lib/` so the template remains easy to copy/paste.  

---

## 🛠 Adding Features

1. Add new stores to `@workspace/store` if they are reusable.  
2. Add new components to `@workspace/ui` if they are presentation-only.  
3. Add new routes or adapters here in the app layer.  
4. Keep commits scoped and clear (UI vs store vs app).  

---

## 🚫 What *not* to do

- ❌ Don’t copy Zustand stores into `apps/region-template`. They belong in `@workspace/store`.  
- ❌ Don’t hardcode UI into routes. Use `@workspace/ui` components.  
- ❌ Don’t introduce region-specific hacks into `@workspace/ui` or `@workspace/store`. Keep them in this app only.  

---

## ✅ Example Flow

- A user opens `/my-profile`.  
- The page uses `ProfileForm` from `@workspace/ui`.  
- State is managed via `useProfileStore` from `@workspace/store`.  
- Persistence comes from the demo localStorage adapter (can be swapped for Supabase).  
- When launching a new region, copy this app and update only the backend adapter + branding.  
