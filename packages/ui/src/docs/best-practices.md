# Best Practices

## Component Design

### 1. Composition over Inheritance

Prefer composing smaller components together rather than creating massive "God components" with dozens of props.

**Bad:**

```tsx
<Card title="Title" description="Desc" footer={<Button>Ok</Button>} />
```

**Good:**

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Desc</CardDescription>
  </CardHeader>
  <CardFooter>
    <Button>Ok</Button>
  </CardFooter>
</Card>
```

### 2. Accessibility (A11y)

- **Interactive Elements**: All interactive elements must be keyboard accessible.
  - Use `<button>` for actions, `<a>` for links.
  - If using a `div` as a button, add `role="button"`, `tabIndex={0}`, and `onKeyDown` handler.
- **Labels**: Ensure all form inputs have associated labels.
- **Contrast**: Verify color contrast ratios.

### 3. Styling

- **Tailwind**: Use Tailwind utility classes. Avoid inline styles (`style={{ ... }}`).
- **Tokens**: Use semantic tokens (e.g., `bg-destructive`) instead of raw hex values or generic colors (`bg-red-500`).
- **Variants**: Use `class-variance-authority` (cva) for defining component variants.

## Naming Conventions

- **Files**: `kebab-case.tsx` (e.g., `my-component.tsx`).
- **Components**: `PascalCase` (e.g., `MyComponent`).
- **Props**: `camelCase` (e.g., `isLoading`).

## Directory Structure

- **Primitives**: `src/primitives/` (Atomic, generic).
- **Common Patterns**: `src/patterns/common/` (Generic, composed).
- **Feature Patterns**: `src/patterns/features/<feature-name>/` (Domain-specific).
