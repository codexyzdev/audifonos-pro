# Zod v4 Migration Guide

This guide summarizes key breaking changes and migration steps for upgrading from Zod v3 to v4.

## Breaking Changes

### Error Customization
The error customization APIs have been unified under a single `error` parameter.

**Deprecated:** `message`, `invalid_type_error`, `required_error`, `errorMap` (as a property).

```typescript
// Zod 3
z.string({
  required_error: "Required",
  invalid_type_error: "Not a string",
});

// Zod 4
z.string({
  error: (issue) => issue.input === undefined ? "Required" : "Not a string"
});
```

### String Formats
String formats are now top-level functions. Method chaining is deprecated.

```typescript
// Zod 3 (Deprecated)
z.string().email();
z.string().uuid();

// Zod 4 (Recommended)
z.email();
z.uuid(); // Note: stricter RFC 9562/4122 compliance
```

### Objects
- **Strict/Passthrough:** `.strict()` and `.passthrough()` are deprecated. Use `z.strictObject()` and `z.looseObject()`.
- **Merge:** `.merge()` is deprecated. Use `.extend()` or object spreading.
- **Deep Partial:** `.deepPartial()` is removed.

### Arrays
- `.nonempty()` is now identical to `.min(1)`. The inferred type is `T[]`, not `[T, ...T[]]`. Use `z.tuple()` with rest args for the old behavior.

### Records
- `z.record()` no longer accepts a single argument. Use `z.record(z.string(), z.string())`.
- Enums as keys now produce required properties, not partials. Use `z.partialRecord()` for optional keys.

### Other Deprecations
- `z.nativeEnum()` -> use `z.enum()`
- `z.promise()` -> await values before validation
- `z.function()` -> returns a function factory, not a schema
- `.format()`, `.flatten()` -> use `z.treeifyError()`

## New Features to leverage
- `z.fromJSONSchema()`
- `z.templateLiteral()`
- `z.stringbool()`
- `z.file()`
- `z.prettifyError()`

For a complete list, see the [Release Notes](https://zod.dev/v4).
