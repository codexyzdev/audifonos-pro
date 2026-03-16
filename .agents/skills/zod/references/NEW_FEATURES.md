# Zod v4 New Features

## Performance
- **14x Faster Strings**: String validation is significantly optimized.
- **7x Faster Arrays**: Array validation performance is boosted.
- **Smaller Bundle**: Core bundle reduced to ~5.36kb.

## Zod Mini
A functional, tree-shakable variant of Zod for strict bundle size constraints.
See `ZOD_MINI.md` for usage.

## JSON Schema Conversion
Native JSON Schema support via `z.toJSONSchema()`.

```typescript
const schema = z.object({ name: z.string(), age: z.number() });
z.toJSONSchema(schema);
// { type: "object", properties: { ... }, required: [...] }
```

## Template Literal Types
Support for template literal types (`z.templateLiteral()`).

```typescript
const hello = z.templateLiteral(["hello, ", z.string()]);
// `hello, ${string}`

const email = z.templateLiteral([z.string().min(1), "@", z.string().max(64)]);
// `${string}@${string}`
```

## Recursive Objects
Define recursive object types directly.

```typescript
const Category = z.object({
  name: z.string(),
  get subcategories() {
    return z.array(Category);
  },
});
```

## File Schemas
Validate `File` instances.

```typescript
const file = z.file();
file.min(10_000); // size in bytes
file.mime(["image/png"]); // MIME type
```

## Stringbool
Advanced boolean parsing for env vars and similar inputs.

```typescript
const strbool = z.stringbool();
strbool.parse("true"); // true
strbool.parse("1"); // true
strbool.parse("yes"); // true
strbool.parse("on"); // true
strbool.parse("false"); // false
strbool.parse("0"); // false
strbool.parse("no"); // false
strbool.parse("off"); // false
```

## Error Formatting
Use `z.prettifyError()` for human-readable errors.

```typescript
const error = new z.ZodError([...]);
console.log(z.prettifyError(error));
```

## Metadata
Add typed metadata to schemas via `z.meta()` and `z.registry()`.

```typescript
const schema = z.string().meta({
  title: "Email Address",
  description: "Provide your email",
});
```

## Top-level String Formats
String formats are now available as top-level functions for better tree-shaking.

- `z.email()`
- `z.uuid()` (stricter RFC compliant)
- `z.url()`
- `z.ipv4()`, `z.ipv6()`
- `z.date()`, `z.time()`, `z.datetime()`
- `z.duration()`

## Number Formats
Fixed-width integer/float types.

- `z.int()`, `z.int32()`, `z.uint32()`
- `z.float32()`, `z.float64()`
- `z.int64()`, `z.uint64()` (BigInt)
