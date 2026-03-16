# Implementation Plan: google-auth-drive-inventory

## Overview

Migrate the AudífonosPro inventory app from localStorage to Google Drive appDataFolder, adding Google OAuth 2.0 authentication. Implementation proceeds in layers: types/interfaces → DriveService → AuthContext → UI components → hook migration → wiring.

## Tasks

- [x] 1. Define shared types and install dependencies
  - Add `@react-oauth/google` and `fast-check` to package.json
  - Define `AuthUser`, `AuthContextValue`, `SyncStatus`, `DriveServiceResult` types in `src/types/index.ts` or a new `src/types/auth.ts`
  - Ensure `InventoryState` and `Transaction` types are exported from `src/types`
  - _Requirements: 1.3, 2.4, 6.1_

- [x] 2. Implement DriveService
  - [x] 2.1 Create `src/services/driveService.ts` with `loadInventory` and `saveInventory` functions
    - Implement file search (`GET /drive/v3/files?spaces=appDataFolder`)
    - Implement file read (`GET /drive/v3/files/{id}?alt=media`)
    - Implement file create (`POST /upload/drive/v3/files?uploadType=multipart`)
    - Implement file update (`PATCH /upload/drive/v3/files/{id}?uploadType=media`)
    - Implement `withRetry` helper (3 attempts, exponential backoff: 1s, 2s, 4s)
    - On 401 response, return a typed error so callers can clear session
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.8_

  - [x] 2.2 Implement localStorage migration logic inside `loadInventory`
    - When no Drive file exists, check `localStorage` key `audifonos-inventory-v1`
    - If valid `InventoryState` found, use it as initial file content and delete the key
    - If invalid/missing, fall back to `INITIAL_STATE`
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 2.3 Write property test for Drive read/write round trip (Property 3)
    - **Property 3: Drive read/write round trip preserves InventoryState**
    - **Validates: Requirements 2.3, 2.4**
    - Use `fc.property(arbitraryInventoryState(), ...)` with mocked fetch
    - Tag: `// Feature: google-auth-drive-inventory, Property 3: Drive read/write round trip preserves InventoryState`

  - [x] 2.4 Write property test for invalid data fallback (Property 4)
    - **Property 4: Invalid data fallback to Initial_State**
    - **Validates: Requirements 2.6, 4.4**
    - Use `fc.property(fc.oneof(fc.string(), arbitraryMalformedObject()), ...)`
    - Tag: `// Feature: google-auth-drive-inventory, Property 4: Invalid data fallback to Initial_State`

  - [x] 2.5 Write property test for localStorage migration (Property 6)
    - **Property 6: Migration uses localStorage data and clears it**
    - **Validates: Requirements 4.2, 4.3**
    - Use `fc.property(arbitraryInventoryState(), ...)` with mocked localStorage and fetch
    - Tag: `// Feature: google-auth-drive-inventory, Property 6: Migration uses localStorage data and clears it`

  - [x] 2.6 Write unit tests for DriveService
    - Correct API endpoints called for each operation
    - `withRetry` retries exactly 3 times on repeated failure
    - 401 response returns typed auth error
    - _Requirements: 2.5, 2.8_

- [x] 3. Checkpoint — Ensure all DriveService tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement AuthContext
  - [x] 4.1 Create `src/contexts/AuthContext.tsx`
    - Wrap `useGoogleLogin` from `@react-oauth/google` to request scopes: `openid email profile https://www.googleapis.com/auth/drive.appdata`
    - Store `AuthUser` (name, email, picture, accessToken) in React state
    - Expose `signIn`, `signOut`, `user`, `isLoading`, `error` via context
    - On `signOut`, clear user state and call `googleLogout()`
    - On OAuth error or user cancel, set descriptive `error` string
    - Log clear console error if `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is missing
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 5.1, 5.2_

  - [x] 4.2 Write property test for auth state drives UI visibility (Property 1)
    - **Property 1: Auth state drives UI visibility**
    - **Validates: Requirements 1.4, 1.7**
    - Use `fc.property(fc.option(arbitraryAuthUser()), ...)` rendering with mocked AuthContext
    - Tag: `// Feature: google-auth-drive-inventory, Property 1: Auth state drives UI visibility`

  - [x] 4.3 Write property test for sign-in/sign-out round trip (Property 2)
    - **Property 2: Sign-in/sign-out round trip clears auth state**
    - **Validates: Requirements 1.6**
    - Use `fc.property(arbitraryAuthUser(), ...)` simulating signIn then signOut
    - Tag: `// Feature: google-auth-drive-inventory, Property 2: Sign-in/sign-out round trip clears auth state`

  - [x] 4.4 Write unit tests for AuthContext
    - Sign-in button renders when unauthenticated
    - User name/photo renders when authenticated
    - Error message shown on OAuth failure
    - _Requirements: 1.1, 1.4, 1.5_

- [x] 5. Implement UI components
  - [x] 5.1 Create `src/components/LoginScreen.tsx`
    - Render "Iniciar sesión con Google" button using `GoogleLogin` or custom button calling `signIn()`
    - Show error message from `AuthContext` when present
    - Hide all inventory UI (only this screen shown when unauthenticated)
    - _Requirements: 1.1, 1.5, 1.7_

  - [x] 5.2 Create `src/components/SyncIndicator.tsx`
    - Accept `SyncIndicatorProps`: `status`, `lastSyncedAt`, `error`, `onRetry`
    - Render visually distinct badge for each of the three states: `sincronizado`, `sincronizando`, `error`
    - Show timestamp when `sincronizado`
    - Show retry button when `error`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 5.3 Create `src/components/UserProfile.tsx`
    - Display authenticated user's name and profile picture
    - Include "Cerrar sesión" button that calls `signOut()` from `AuthContext`
    - _Requirements: 1.4, 1.6_

  - [x] 5.4 Write property test for SyncIndicator states (Property 7)
    - **Property 7: Sync indicator reflects all three states**
    - **Validates: Requirements 6.1**
    - Use `fc.property(fc.constantFrom('sincronizado', 'sincronizando', 'error'), ...)`
    - Tag: `// Feature: google-auth-drive-inventory, Property 7: Sync indicator reflects all three states`

  - [x] 5.5 Write unit tests for SyncIndicator and UserProfile
    - SyncIndicator shows timestamp after successful save
    - SyncIndicator shows retry button in error state
    - Retry button click calls `onRetry`
    - _Requirements: 6.2, 6.4, 6.5_

- [x] 6. Migrate useInventory hook to DriveService
  - [x] 6.1 Update `src/hooks/useInventory.ts` to accept `accessToken: string | null`
    - Remove `localStorage` read/write effects
    - On mount (when `accessToken` is set), call `driveService.loadInventory(accessToken)` and set state
    - Replace the `isLoaded` localStorage effect with Drive load result
    - Add `syncStatus: SyncStatus`, `lastSyncedAt: Date | null`, `syncError: string | null`, `retrySync` to return value
    - _Requirements: 2.3, 2.4, 2.7, 6.1_

  - [x] 6.2 Add debounced Drive save on inventory state changes
    - Debounce writes at 500ms using `useRef` + `setTimeout`
    - On each inventory mutation, set `syncStatus = 'sincronizando'` immediately
    - On successful save, set `syncStatus = 'sincronizado'` and `lastSyncedAt = new Date()`
    - On failure after retries, set `syncStatus = 'error'` and `syncError`
    - Implement `retrySync` to re-trigger save with current state
    - _Requirements: 2.4, 2.5, 6.2, 6.3, 6.4, 6.5_

  - [x] 6.3 Write property test for reset restores Initial_State (Property 5)
    - **Property 5: Reset restores Initial_State**
    - **Validates: Requirements 3.4**
    - Use `fc.property(arbitraryInventoryState(), ...)` with mocked DriveService
    - Tag: `// Feature: google-auth-drive-inventory, Property 5: Reset restores Initial_State`

  - [x] 6.4 Write unit tests for updated useInventory hook
    - `addExit` rejects when quantity exceeds stock
    - `addMultiExit` validates all items before mutating state
    - `retrySync` triggers a Drive write with current state
    - _Requirements: 2.4, 2.5, 3.4_

- [x] 7. Checkpoint — Ensure all hook and component tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Wire everything together in layout and dashboard
  - [x] 8.1 Update `src/app/layout.tsx`
    - Wrap app with `<GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>` 
    - Wrap with `<AuthProvider>` inside `GoogleOAuthProvider`
    - _Requirements: 1.2, 5.1_

  - [x] 8.2 Update `src/inventory/components/inventory-dashboard.tsx`
    - Consume `AuthContext` to get `user` and conditionally render `LoginScreen` vs inventory UI
    - Pass `user.accessToken` to `useInventory`
    - Add `<SyncIndicator>` with `syncStatus`, `lastSyncedAt`, `syncError`, `retrySync` from hook
    - Add `<UserProfile>` with authenticated user data
    - _Requirements: 1.7, 2.7, 6.1_

- [x] 9. Create developer documentation
  - [x] 9.1 Create `docs/google-cloud-setup.md`
    - Step-by-step: create GCP project, enable Drive API, configure OAuth consent screen, create OAuth 2.0 client ID
    - _Requirements: 5.3_

  - [x] 9.2 Create `docs/environment-setup.md`
    - Instructions for setting `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `.env.local` (dev) and production
    - _Requirements: 5.4_

  - [x] 9.3 Create `docs/drive-api-scopes.md`
    - Explain `drive.appdata` scope, why it was chosen over full Drive access, and what it allows
    - _Requirements: 5.5_

- [x] 10. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with a minimum of 100 iterations each
- Unit tests use Vitest + `@testing-library/react`
- The `NEXT_PUBLIC_GOOGLE_CLIENT_ID` env var replaces the `VITE_GOOGLE_CLIENT_ID` referenced in requirements (Next.js prefix)
