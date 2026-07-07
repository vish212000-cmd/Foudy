# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: test_webrtc_production.spec.ts >> Production WebRTC Certification
- Location: test_webrtc_production.spec.ts:172:1

# Error details

```
Test timeout of 60000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - 'generic "Connection Status: offline" [ref=e3]'
  - generic [ref=e8]:
    - paragraph [ref=e9]: We use cookies to improve your experience, remember your preferences, and secure our WebRTC connections. By clicking "Accept", you consent to our use of cookies.
    - generic [ref=e10]:
      - link "Privacy Policy" [ref=e11] [cursor=pointer]:
        - /url: /privacy
      - button "Accept" [ref=e12]
  - generic [ref=e13]:
    - generic [ref=e16]:
      - generic "FOUDY" [ref=e17]:
        - generic [ref=e19]: F
        - generic [ref=e20]: FOUDY
      - generic [ref=e21]:
        - heading "Sign in to FOUDY" [level=2] [ref=e22]
        - paragraph [ref=e23]:
          - text: Don't have an account?
          - link "Go to sign up page" [ref=e24] [cursor=pointer]:
            - /url: /register
            - text: Sign up
      - generic [ref=e25]:
        - form "Sign in form" [ref=e26]:
          - generic [ref=e27]:
            - generic [ref=e28]:
              - generic [ref=e29]: Email address
              - textbox "you@example.com" [ref=e31]
            - generic [ref=e32]:
              - generic [ref=e33]: Password
              - generic [ref=e34]:
                - textbox [ref=e35]
                - button "Show password" [ref=e37]:
                  - img [ref=e38]
            - generic [ref=e41]:
              - generic [ref=e42] [cursor=pointer]:
                - checkbox "Remember me on this device" [ref=e43]
                - checkbox
                - generic [ref=e44]: Remember me
              - link "Forgot your password? Reset it here" [ref=e45] [cursor=pointer]:
                - /url: /forgot-password
                - text: Forgot password?
            - button "Sign in to your FOUDY account" [ref=e46]: Sign in
        - separator "Or continue with a social account" [ref=e47]:
          - separator [ref=e48]
          - generic [ref=e49]: or continue with
          - separator [ref=e50]
        - generic [ref=e51]:
          - button "Continue with Google" [ref=e52]:
            - generic [ref=e54]: G
            - generic [ref=e55]: Google
          - button "Continue with Apple" [ref=e56]:
            - img [ref=e57]
            - generic [ref=e59]: Apple
      - paragraph [ref=e60]:
        - text: By signing in you agree to our
        - link "Terms of Service" [ref=e61] [cursor=pointer]:
          - /url: /terms
        - text: and
        - link "Privacy Policy" [ref=e62] [cursor=pointer]:
          - /url: /privacy
        - text: .
    - generic [ref=e68]:
      - img [ref=e70]
      - heading "Connect beyond borders." [level=2] [ref=e73]
      - paragraph [ref=e74]: FOUDY is the premium platform for spontaneous, meaningful conversations. Drop in and meet the world.
      - list [ref=e75]:
        - listitem [ref=e76]:
          - img [ref=e78]
          - generic [ref=e84]: Instant global voice & video matching
        - listitem [ref=e85]:
          - img [ref=e87]
          - generic [ref=e92]: Public and private interest-based rooms
        - listitem [ref=e93]:
          - img [ref=e95]
          - generic [ref=e97]: Secure, anonymous, and moderated environment
```