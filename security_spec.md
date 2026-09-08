# Security Specification & Threat Model

## 1. Data Invariants
- A user document at `/users/{userId}` must possess matching document ID and payload `id`.
- The user's role must be restricted to valid enum values (`admin`, `tutor`, `student`, `guest`).
- PII fields (`email`, `phoneNumber`, `billingAddress`) must be protected from unauthenticated access.
- Admins (including the configured platform admin `theinsiderspace@gmail.com`) maintain management rights.
- Users can view and manage their own profile records.
- Identity and role escalation during self-updates is forbidden for non-admins.

## 2. The Dirty Dozen Payloads
1. **Unauthenticated Read of All Users**: Anonymous request attempting `list /users` -> DENIED.
2. **Identity Spoofing on Create**: Authenticated user `user-123` attempting to create `/users/user-999` with `id: "user-999"` -> DENIED (unless admin).
3. **Role Escalation Attack**: Student attempting to update `role: "admin"` -> DENIED.
4. **Denial-of-Wallet Path Length Injection**: Attempting document ID with 5,000 characters -> DENIED.
5. **Denial-of-Wallet String Inflation**: Sending `name` with 100,000 characters -> DENIED.
6. **Ghost Field Injection (Shadow Update)**: Sending unauthorized field `__internal_bypass: true` -> DENIED.
7. **Unverified Email Impersonation**: Request claiming admin email without verification -> DENIED.
8. **Malicious Enum Injection**: Setting `role: "super_root"` -> DENIED.
9. **Cross-Tenant Deletion**: Non-admin attempting to delete another student's account -> DENIED.
10. **Array Overflow Exploit**: Injecting 10,000 entries into `dreamColleges` -> DENIED.
11. **Negative Target Score**: Setting `targetScore: -500` -> DENIED.
12. **Blanket Query Scraping**: Running unbounded client queries without filtering -> DENIED.

## 3. Test Invariants
All operations violating the above invariants must yield `PERMISSION_DENIED`.
