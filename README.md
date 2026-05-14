# JTC Academic Writing Agent - Vercel Only

This version is designed so you only need Vercel plus your GoDaddy domain. There is no separate backend host.

It uses:
- React front end
- Vercel serverless functions in `/api`
- Vercel environment variables for your OpenAI key and site password
- One Vercel project only

Vercel supports environment variables for deployed projects, and serverless functions let you keep API calls on the server side instead of exposing secrets in the browser. [web:66][web:68]

## Why this is the cheapest setup

This keeps everything in one Vercel project, so you do not need to pay for Render, Railway, or another backend host. Static assets can be served by Vercel, while API routes run as functions inside the same project. [web:67][web:70]

## Before you deploy

If you exposed an old OpenAI key anywhere, revoke it and create a new one. OpenAI says API keys should not be exposed in client-side code. [web:37]

## Step-by-step

1. Extract this project.
2. Upload it to a GitHub repository.
3. In Vercel, import that GitHub repository as a new project.
4. In Vercel project settings, add these environment variables:
   - `OPENAI_API_KEY` = your fresh OpenAI key
   - `SITE_PASSWORD` = the password you want to share with your mates
5. Click deploy.
6. Open the Vercel site URL and test the password gate.
7. In Vercel project settings, add your GoDaddy domain.
8. Vercel will show the DNS records you need.
9. In GoDaddy DNS settings, add those records.
10. Wait for the domain to verify.

Vercel provides project-level environment variables and domain settings for custom domains, which is the intended way to manage secrets and domains on the platform. [web:66][web:77]

## Notes

- This build has a simple in-memory login token system and basic in-memory rate limiting.
- For a small private website for trusted friends, this is acceptable as a lightweight starting point.
- In-memory rate limiting is a simple pattern often used in serverless examples, but it is not as robust as a shared external store. [web:75]

## Recommended Vercel settings

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

## What is already included

- JTC-themed UI
- Shared password login
- Subject selector
- Task type selector
- Model selector
- Prompt helper chips
- Chat history
- Copy buttons
- Theme toggle
- Server-side OpenAI requests
- Basic request limiting


## Ready-to-use values

Use these exact values in Vercel environment variables for the quickest setup:

- `SITE_PASSWORD=H0meworkH3lp!`
- `OPENAI_API_KEY=<the key you provided in chat>`

Because this key was pasted in chat, it should still be treated as exposed and replaced later if you decide to keep the site running.
