# 🎨 Contributing Guide for `@workspace/ui`

Welcome! This package defines all **shared UI components** (forms, maps, dialogs, hooks, styles). It should remain lightweight, reusable, and independent of any application data logic.

---

## 🎯 Purpose

- Provide **reusable UI components** used across apps and regions.
- Keep `@workspace/ui` **data-agnostic** → components only accept props, never import stores or query databases directly.
- Encapsulate design tokens, utility functions, and Tailwind setup for consistency.
- Make it easy to copy/paste or drop this package into new apps without bringing in backend logic.

---

## 📂 Folder Structure

packages/ui/  
  src/  
    components/ – Shared React components (buttons, forms, map wrappers, etc.)  
    hooks/ – Generic reusable hooks  
    lib/ – Utility functions (class merging, constants, etc.)  
    styles/ – Global styles (Tailwind, CSS resets, etc.)  
CONTRIBUTING.md – This file

---

## 📐 Conventions

1. **Prop-driven design**
   - Components must not import Zustand stores or talk to databases.
   - State is passed in from apps or from `@workspace/store` hooks.

2. **Accessibility first**
   - Follow [WAI-ARIA](https://www.w3.org/WAI/ARIA/) guidelines.
   - Use Radix primitives or other a11y-friendly libraries where possible.

3. **Styling**
   - Use Tailwind utilities and `tailwind-merge` for class composition.
   - Avoid inline styles unless absolutely necessary.

4. **Export patterns**
   - Components should be exported from `src/components`.
   - Re-export from `src/index.ts` for ergonomic imports.

5. **Keep it general-purpose**
   - UI components should not encode app-specific business rules.
   - Example: `ProfileForm` accepts `value` and `onChange`, but does not know about Supabase or Zustand.

---

## 🛠 Adding a New Component

1. Add the component in `src/components/`.
2. If it has internal state, keep it encapsulated (don’t rely on global stores).
3. Add exports to `src/index.ts`.
4. Ensure it has proper types for props.
5. Test it in at least one app before committing.

---

## 🚫 What _not_ to do

- ❌ Don’t import Zustand stores or backend APIs.
- ❌ Don’t hardcode region- or app-specific logic.
- ❌ Don’t duplicate existing design patterns.

---

## ✅ Example Usage

import { Button } from "@workspace/ui/components/Button"

export function Demo() {  
  return <Button variant="primary">Click me</Button>  
}
