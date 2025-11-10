# 📖 Contributing Guide for `@workspace/store`

Welcome! This package defines all **shared application state** using [Zustand](https://github.com/pmndrs/zustand). It is the single source of truth for stores used across all region templates and UI components.

---

## 🎯 Purpose

- Provide **reusable Zustand stores** (e.g. `useProfileStore`, `useDispatchStore`).
- Keep **business logic** (data/state shape, actions, persistence) in one place.
- Allow **apps** (like `apps/region-template`) to connect stores to different backends (Supabase, PocketServer, local demo DB).
- Keep `@workspace/ui` **store-agnostic** → components receive props or consume hooks passed down from apps.

---

## 📂 Folder Structure

packages/store/  
  src/  
    profileStore.ts – Example profile state  
    index.ts – Barrel exports  
CONTRIBUTING.md – This file

- Each store should live in its own file.
- index.ts should re-export stores for ergonomic imports.

---

## 📐 Conventions

1. **Type first**  
   Define TypeScript types/interfaces at the top of each store file.

2. **Zustand with middleware**  
   Always wrap stores with `persist` if client persistence is useful.

3. **No side effects in `@workspace/store`**
   - Don’t fetch from Supabase, PocketServer, etc.
   - Keep the store purely client-side state + actions.
   - Persistence adapters (localStorage, IndexedDB, remote sync) can be swapped in apps.

4. **Avoid UI coupling**
   - Don’t import from `@workspace/ui`.
   - Stores should be framework-agnostic, only depend on Zustand.

5. **Barrel exports**  
   Always add new stores to src/index.ts.

---

## 🛠 Adding a New Store

1. Create a new file in src/, e.g. dispatchStore.ts.
2. Define the types and Zustand store.
3. Add an export in src/index.ts.
4. Use it in apps with `import { useDispatchStore } from "@workspace/store"`.

---

## 🚫 What _not_ to do

- ❌ Don’t import stores directly from apps/\*.
- ❌ Don’t bake in Supabase, fetch calls, or environment-specific logic.
- ❌ Don’t add UI logic (validation, components). That belongs in @workspace/ui.

---

## ✅ Example Usage

import { useProfileStore } from "@workspace/store"

export function ProfileBadge() {  
  const profile = useProfileStore((s) => s.profile)  
  return <span>{profile?.display_name ?? "Anonymous"}</span>  
}
