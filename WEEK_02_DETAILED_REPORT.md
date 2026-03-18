# Week 2 Detailed Report

## 1. Summary
Week 2 delivered the complete authentication backend layer required for Week 3 client integration. The implementation includes registration, email verification, login, token refresh rotation, logout, password reset, auth middleware, lockout policy, and route-level protection controls.

## 2. Scope and Target Outcomes
Primary Week 2 objectives:
- Build complete auth API surface.
- Implement secure token architecture (access + refresh).
- Add OTP verification workflow with Redis TTL.
- Add password reset flow.
- Add abuse controls (rate limit + lockout).
- Provide stable backend contracts for mobile/web integration in Week 3.

Out of scope:
- OAuth provider integrations (planned for later phase tasks).
- End-user UI implementation (Week 3 focus).

## 3. Auth System Delivered

### 3.1 Endpoints
Implemented under /api/v1/auth:
- POST /register
- POST /verify-email
- POST /login
- POST /refresh
- POST /logout
- POST /forgot-password
- POST /reset-password
- GET /me

### 3.2 Validation and Contracts
Request validation is implemented using Zod schemas for:
- register
- verify-email
- login
- forgot-password
- reset-password

API responses are standardized into success and error envelopes.

### 3.3 Token Architecture
Delivered design:
- Access token returned in JSON body.
- Refresh token stored in HTTP-only cookie.
- Refresh token families persisted with Redis backing.
- Rotation flow implemented in refresh endpoint.

Security behavior:
- Invalid refresh paths return unauthorized.
- Logout clears cookie and invalidates current family path.

### 3.4 OTP and Verification
Implemented behavior:
- Registration creates unverified user account.
- OTP generated and hashed.
- OTP stored in Redis with 10-minute TTL.
- verify-email compares OTP hash and activates account.
- Token pair issued after successful verification.

### 3.5 Password Reset
Implemented behavior:
- forgot-password returns generic success for enumeration safety.
- Reset token generated securely and stored with 1-hour TTL.
- reset-password validates token, updates password hash, and invalidates active token families.

### 3.6 Lockout and Abuse Controls
Implemented behavior:
- Failed login counting in Redis.
- Account lock after threshold failures.
- Lock window enforced.
- Route-level auth rate limiting enabled.

## 4. Data Model Upgrades

### 4.1 User Model
Added or finalized key auth fields:
- emailVerified
- status lifecycle values
- role
- plan
- oauthProviders
- refreshTokenFamilies
- failedLoginAttempts
- lockUntil
- lastLoginAt
- expoPushToken

### 4.2 Health Profile Model
Expanded baseline profile fields to support future clinical modules and account setup defaults.

## 5. Middleware and Core Utilities
Delivered:
- JWT helper module for sign/verify.
- Authentication middleware that extracts bearer tokens and populates req.user.
- Error middleware improvements for validation and API-friendly failures.
- Response helper utilities for consistent payload formatting.
- Email service abstraction with SMTP support and non-configured safe fallback logging.

## 6. Verification Matrix

### 6.1 Build and Static Checks
Validated:
- API lint passes.
- API type-check passes.
- API build passes.
- Monorepo checks pass.

### 6.2 Runtime Smoke Validation
Executed against running MongoDB + Redis:
- register: success
- verify-email: success
- login: success
- refresh: success
- logout: success

Additional verified behaviors:
- lockout reached after repeated invalid login attempts.
- forgot-password returns safe generic response.
- reset-password succeeds with valid token path.

## 7. Files Added
- apps/api/src/config/jwt.ts
- apps/api/src/controllers/auth.controller.ts
- apps/api/src/middleware/auth.middleware.ts
- apps/api/src/routes/auth.routes.ts
- apps/api/src/services/email.service.ts
- apps/api/src/utils/errors.ts
- apps/api/src/utils/response.ts
- apps/api/src/validators/auth.validator.ts

## 8. Files Updated
- apps/api/package.json
- apps/api/src/app.ts
- apps/api/src/config/env.ts
- apps/api/src/middleware/error.middleware.ts
- apps/api/src/models/User.model.ts
- apps/api/src/models/HealthProfile.model.ts
- apps/api/src/routes/index.ts
- package-lock.json

## 9. Defects Found and Fixed During Week 2
Key corrections completed during implementation and smoke verification:
- Resolved refresh family write conflict in controller update flow.
- Corrected route/middleware wiring for stable runtime behavior.
- Added missing typing dependencies for clean TypeScript checks.
- Stabilized CI check naming compatibility for branch rulesets.

## 10. Release and Branch State
Week 2 auth changes were merged through protected-branch workflow with required checks passing. Branch content parity between main and develop was verified by direct diff check.

## 11. Completion Decision
Week 2 authentication backend is complete and integration-ready for Week 3 frontend work.

Completion criteria satisfied:
- Endpoint surface delivered.
- Security and token flow delivered.
- Lockout and anti-abuse controls delivered.
- Runtime verification completed.
- CI and branch governance checks passed.

## 12. Week 3 Handoff Notes
- Frontend can integrate directly with /api/v1/auth contracts.
- Cookie handling requirements should be reflected in client networking setup.
- SMTP credentials can be enabled when production mail provider is finalized.
