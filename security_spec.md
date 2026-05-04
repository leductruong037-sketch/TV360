# Security Specification for TV360 Website

This document outlines the security architecture and invariants for the Firebase backend.

## 1. Data Invariants

-   **User Identity**: Every document in the `users` collection must have an ID that exactly matches the `uid` of the authenticated user.
-   **Role Integrity**: The `role` field can only be 'admin' or 'user'. Only existing admins can change a user's role. New users defaults to 'user' unless bootstrapped.
-   **Immutability**: The `uid` and `createdAt` fields are set once at creation and cannot be modified.
-   **Field Validity**: 
    - `displayName` must be a string <= 100 characters.
    - `photoURL` must be a string <= 2000 characters.
    - `watchedChannels` must be a list of strings, max 500 items.
    - `email` must match the authenticated user's email.

## 2. The Dirty Dozen (Test Cases)

| ID | Attack Vector | Payload/Context | Expected Result |
|:---|:---|:---:|:---:|
| 1 | **Identity Spoofing** | Auth: UID_A, Write: `/users/UID_B` | `PERMISSION_DENIED` |
| 2 | **Privilege Escalation** | Create `/users/UID_A` with `{ role: "admin" }` | `PERMISSION_DENIED` |
| 3 | **Immutable Modification** | Update `/users/UID_A` changing `createdAt` | `PERMISSION_DENIED` |
| 4 | **Shadow Field Injection** | Update `/users/UID_A` adding `{ isVerified: true }` | `PERMISSION_DENIED` |
| 5 | **PII Leakage** | Auth: UID_A, Read: `/users/UID_B` | `PERMISSION_DENIED` |
| 6 | **Type Poisoning** | Update `watchedChannels` to `{ "0": "VTV1" }` (Map instead of List) | `PERMISSION_DENIED` |
| 7 | **Massive String Attack** | Update `displayName` with 1MB string | `PERMISSION_DENIED` |
| 8 | **ID Poisoning** | Create `/users/very-long-id-beyond-limit...` | `PERMISSION_DENIED` |
| 9 | **Role Modification** | Non-admin updating their own `role` field | `PERMISSION_DENIED` |
| 10 | **Anonymous Write** | No Auth, attempt write to `/users/any` | `PERMISSION_DENIED` |
| 11 | **Email Mismatch** | Auth Email: `a@b.com`, Write: `{ email: "evil@malicious.com" }` | `PERMISSION_DENIED` |
| 12 | **Array Explosion** | Update `watchedChannels` with 10,000 items | `PERMISSION_DENIED` |

## 3. Test Runner (Draft)

```typescript
// firestore.rules.test.ts
// This file would be used with @firebase/rules-unit-testing
// Implementation details skipped for brevity in this spec file.
```
