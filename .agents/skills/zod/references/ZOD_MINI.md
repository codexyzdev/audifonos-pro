# Zod Mini

Zod Mini (`zod/mini`) is a functional, tree-shakable variant of Zod v4.

## Imports
```typescript
import * as z from "zod/mini";
```

## Usage
Instead of chaining methods, use `z.check()` or `.with()` (alias) to apply refinements.

```typescript
// Standard Zod
z.string().email().min(5);

// Zod Mini
z.string().with(
  z.email(),
  z.minLength(5)
);
```

## Available Refinements
Most Zod methods have a corresponding functional refinement:
- `.min(n)` -> `z.min(n)` (for numbers), `z.minLength(n)` (for strings/arrays)
- `.max(n)` -> `z.max(n)`, `z.maxLength(n)`
- `.email()` -> `z.email()`
- `.url()` -> `z.url()`
- `.uuid()` -> `z.uuid()`
- `.regex(r)` -> `z.regex(r)`
- `.optional()` -> `z.optional()` (wrapper)
- `.nullable()` -> `z.nullable()` (wrapper)

## Metadata
Zod Mini supports metadata via `z.meta()` and `z.describe()`:

```typescript
const schema = z.string().with(
  z.describe("User's full name"),
  z.meta({ deprecated: false })
);
```
