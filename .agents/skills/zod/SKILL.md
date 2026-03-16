---
name: zod
description: Complete guide and reference for using Zod v4 (specifically v4.2.1+) for schema validation in TypeScript/JavaScript. Use when defining schemas, validating data, inferring types, or migrating from v3. Covers Zod standard and Zod Mini.
---

# Zod (v4.2.1+)

Zod is a TypeScript-first schema declaration and validation library. This skill covers Zod v4 features and best practices.

## When to use this skill

- Creating data schemas for runtime validation
- Inferring static TypeScript types from schemas
- Validating API responses, form inputs, or configuration
- Migrating from Zod v3 to v4
- Optimizing bundle size with Zod Mini

## Zod v4 Key Features

- **Performance**: Significantly faster parsing (14x string, 7x array).
- **Bundle Size**: Smaller core bundle (5.36kb vs 12.47kb in v3).
- **Zod Mini**: A tree-shakable, functional API variant (`zod/mini`) for strict bundle size requirements.
- **Top-Level String Formats**: `z.email()`, `z.uuid()` instead of methods.
- **New Methods**: `z.fromJSONSchema()`, `z.xor()`, `z.looseRecord()`, `z.exactOptional()`.
- **New Types**: `z.file()`, `z.templateLiteral()`, `z.stringbool()`.

See [NEW_FEATURES.md](references/NEW_FEATURES.md) for a complete list.

## Quick Start

```typescript
import { z } from "zod";

// Create a schema
const User = z.object({
  username: z.string().min(3),
  age: z.number().int().positive(),
  email: z.email(), // Top-level format preferred in v4
  isAdmin: z.boolean().default(false),
});

// Infer the type
type User = z.infer<typeof User>;

// Validate data
const result = User.safeParse({
  username: "alice",
  age: 25,
  email: "alice@example.com",
});
if (!result.success) {
  // Use new pretty-printing
  console.error(z.prettifyError(result.error));
} else {
  console.log(result.data);
}
```

## Zod Mini (Tree-shakable)

For projects where bundle size is critical, use `zod/mini`. It uses wrapper functions instead of methods.

```typescript
import * as z from "zod/mini";

const schema = z.string().with(z.minLength(5), z.email());
```

See [ZOD_MINI.md](references/ZOD_MINI.md) for details.

## Common Patterns

### Primitives

```typescript
z.string();
z.number();
z.bigint();
z.boolean();
z.date();
z.symbol();
z.undefined();
z.null();
z.void();
z.any();
z.unknown();
z.never();
```

### Complex Types

- **Arrays**: `z.array(z.string())` or `z.string().array()`
- **Objects**: `z.object({ name: z.string() })`
- **Unions**: `z.union([z.string(), z.number()])` or `z.string().or(z.number())`
- **Intersections**: `z.intersection(A, B)` or `A.and(B)`
- **Tuples**: `z.tuple([z.string(), z.number()])`
- **Records**: `z.record(z.string(), z.string())` (Note: requires 2 args now)
- **Maps**: `z.map(z.string(), z.number())`
- **Sets**: `z.set(z.number())`

### New in v4

- **JSON Schema**: `z.fromJSONSchema(jsonSchema)`
- **Exclusive Union**: `z.xor([A, B])` (fails if both match)
- **Partial Records**: `z.looseRecord(keySchema, valueSchema)` (ignores non-matching keys)
- **Strict Optional**: `z.exactOptional()` (allows omission but forbids `undefined` value)
- **File Validation**: `z.file().mime(["image/png"])`
- **String Boolean**: `z.stringbool()`

## Migration from v3

See [MIGRATION.md](references/MIGRATION.md) for:

- Error customization changes (`error` param)
- Deprecated methods (`.email()`, `.strict()`, `.passthrough()`, `.deepPartial()`)
- Array `.nonempty()` changes

## Advanced Usage

See [ADVANCED.md](references/ADVANCED.md) for:

- Custom validation (`.refine()`, `.superRefine()`)
- Error handling & customization
- Coercion
- Transformations
