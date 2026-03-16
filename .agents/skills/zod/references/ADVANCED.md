# Advanced Zod Usage

## Custom Validation
Use `.refine()` for custom logic.

```typescript
const password = z.string().refine((val) => val.length >= 8, {
  error: "Password must be at least 8 characters",
});
```

Use `.superRefine()` for more control over error reporting.

```typescript
const schema = z.string().superRefine((val, ctx) => {
  if (val.length < 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_small,
      minimum: 3,
      type: "string",
      inclusive: true,
      message: "Too short",
    });
  }
});
```

## Coercion
Zod provides `z.coerce` for automatic type coercion. Note: Input is `unknown` in v4.

```typescript
const schema = z.coerce.number(); // "123" -> 123
const date = z.coerce.date(); // "2023-01-01" -> Date object
```

## Transformations
Use `.transform()` to modify data after validation.

```typescript
const stringToNumber = z.string().transform((val) => val.length);
stringToNumber.parse("hello"); // => 5
```

## Error Handling
Use `safeParse` to avoid throwing errors.

```typescript
const result = schema.safeParse(data);
if (!result.success) {
  // result.error is a ZodError
  console.log(z.prettifyError(result.error)); // New in v4
}
```

## Error Customization
Unified `error` parameter replaces `message`, `invalid_type_error`, etc.

```typescript
z.string({
  error: (issue) => {
    if (issue.code === "too_small") {
      return `Value must be >${issue.minimum}`;
    }
    return issue.message;
  },
});
```
