# UI Package Documentation

Welcome to the `@workspace/ui` package. This library provides a set of reusable UI components, primitives, and patterns for building consistent and accessible applications.

## Architecture

The library is organized into four layers:

### 1. Design Tokens (`src/styles`)

- **Source of Truth**: `globals.css` defines CSS variables for colors, typography, spacing, and radius.
- **Usage**: Use Tailwind utility classes that map to these variables (e.g., `bg-primary`, `text-muted-foreground`).

### 2. Primitives (`src/primitives`)

- **Definition**: Low-level, atomic components with no business logic.
- **Examples**: `Button`, `Input`, `Dialog`, `Sheet`.
- **Rules**:
  - Must be accessible (built on Radix UI).
  - Must support theming via tokens.
  - Must use `cva` for variants.

### 3. Patterns (`src/patterns`)

- **Definition**: Compound components that compose primitives.
- **Common** (`src/patterns/common`): Generic patterns used across multiple features (e.g., `DateTimePicker`, `LoadingButton`).
- **Features** (`src/patterns/features`): Domain-specific patterns organized by feature (e.g., `teleprompter`, `campaign`).

### 4. Documentation (`src/docs`)

- You are here!

## Usage

### Importing Components

```tsx
// Primitives
import { Button } from "@workspace/ui/primitives/button"; // Mapped export
// OR
import { Button } from "@workspace/ui/primitives/button"; // Direct export

// Patterns
import { DateTimePicker } from "@workspace/ui/patterns/common/date-time-picker";
import { TeleprompterShell } from "@workspace/ui/patterns/features/teleprompter/teleprompter-shell";
```

## Contributing

Please refer to [Best Practices](./best-practices.md) for guidelines on creating new components.
