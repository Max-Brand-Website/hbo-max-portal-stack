## Max Portal Stack

This is a lightweight Next.js 13.4+ app deployed on Vercel. It uses a single route handler, `/api/password`, to capture form submissions from Webflow and email the recipient the password for the portal. All logic is inside `/api/password/route.ts`.

### Editing the email

The email template is found at `/emails/portal-password.tsx`. This is written with Resend's [React Email](https://react.email/docs/integrations/resend) library. You can use `npm run dev:email` to run React Email's local dev server and quickly test changes locally.

### Deploying to production

Commits to `main` will automatically deploy to production. This happens inside of our Vercel workspace. If you run into any issues, test locally with `npm run build` to mimic a production build.
