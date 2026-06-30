# Django Admin Multi-Factor Authentication (MFA) Strategy

## Objective
To secure the FOUDY Django Admin panel (`/admin/`) from compromised staff credentials.

## Recommended Implementation
For the production release, it is highly recommended to integrate **django-mfa3** or **django-two-factor-auth**.

### Steps to Implement:
1. `pip install django-mfa3`
2. Add `'mfa'` to `INSTALLED_APPS`.
3. Add `mfa.middleware.MfaMiddleware` to `MIDDLEWARE`.
4. Configure `MFA_ENFORCE_RECOVERY_METHOD = True`.

By doing this, any user with `is_staff=True` attempting to access `/admin/` will be intercepted and required to register a WebAuthn (Passkey) or TOTP (Authenticator App) device before proceeding.

## Alternative (Network Level)
If application-level MFA is not desired, the `/admin/` path should be blocked at the CDN/WAF level (e.g., Cloudflare Access) requiring Zero Trust network authentication (SSO) before reaching the Django server.
