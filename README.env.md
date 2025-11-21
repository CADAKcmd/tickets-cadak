# Environment Variables and Deployment Checklist

This project requires several environment variables for Firebase and Paystack to work correctly. Add these to your hosting provider (Vercel) and to a local `.env.local` for development.

## Required Firebase (public) - add to Vercel as `NEXT_PUBLIC_*`

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`

These values come from the Firebase Console → Project Settings → "General" (Your apps) and the SDK config snippet.

## Required Paystack (server-only)

- `PAYSTACK_SECRET_KEY` (DO NOT prefix with `NEXT_PUBLIC_`) — keep this secret and add it to Vercel as a server-only variable.

## Optional (if used)

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

## Local development (.env.local example)

Create a file at the project root named `.env.local` with these keys (replace placeholders):

```
NEXT_PUBLIC_FIREBASE_API_KEY=yourFirebaseApiKey
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abcdefg
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
PAYSTACK_SECRET_KEY=sk_test_xxx
# Optional
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=unsigned-preset
```

## Vercel setup (step-by-step)

1. Go to your Vercel dashboard and open the project.
2. Settings → Environment Variables.
3. Add each variable listed above. For `PAYSTACK_SECRET_KEY` set it for `Production` and `Preview` but mark it as a secret (server-only) — do not prefix it with `NEXT_PUBLIC_`.
4. After saving, trigger a redeploy (push to `main` or click "Redeploy" in Vercel).

## Verify after deploy

- Check the Vercel deployment logs; you should not see the console warning `Missing Firebase env vars`.
- Test user flows: sign-in, dashboard access, ticket purchase (Paystack flow).

## Troubleshooting

- If you still see `Missing Firebase env vars: ...` in browser console after deploy, confirm the variable names match exactly and that they are set for the `Production` environment.
- If Paystack requests fail on server routes, verify `PAYSTACK_SECRET_KEY` is present in the server environment and restart the deployment.

## Recommended code improvements (optional)

- Replace direct `db`/`auth` usages in sensitive server code with `getDbOrThrow()` / `getAuthOrThrow()` from `src/lib/firebase.ts` to fail fast with a helpful error when envs are missing.
- Tighten types to avoid `any` in new code.

If you want, I can: (A) update several call sites to use `getDbOrThrow()`/`getAuthOrThrow()` now, (B) open a PR with these changes, or (C) just leave this checklist and help you set env vars in Vercel step-by-step.
