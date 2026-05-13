# Excuse Machine™

AI-powered excuses for every situation. Built with React + Vercel serverless functions + Stripe.

## Live site: aivaultco.com

---

## DEPLOY TO GITHUB + VERCEL — EXACT STEPS

### Step 1: Create GitHub repository (5 min)

1. Go to github.com → click the "+" → "New repository"
2. Name it: `excuse-machine`
3. Set to **Private**
4. Do NOT add README or .gitignore (we already have them)
5. Click "Create repository"

GitHub will show you a URL like: `https://github.com/YOURNAME/excuse-machine.git`

### Step 2: Upload files to GitHub (5 min)

Option A — Upload via browser (easiest, no coding needed):
1. On your new repo page, click "uploading an existing file"
2. Drag ALL files from this folder into the browser window:
   - src/App.js
   - src/index.js
   - public/index.html
   - api/excuse.js
   - package.json
   - vercel.json
   - .gitignore
3. Keep the folder structure exactly as-is (src/, public/, api/)
4. Click "Commit changes"

Option B — Git command line:
```
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOURNAME/excuse-machine.git
git push -u origin main
```

### Step 3: Deploy to Vercel (5 min)

1. Go to vercel.com → Sign up/Login with GitHub
2. Click "Add New Project"
3. Import your `excuse-machine` repository
4. Vercel auto-detects Create React App — click "Deploy"
5. Wait ~2 minutes for first deploy

### Step 4: Add your Anthropic API key to Vercel (2 min)

This is REQUIRED — without it the excuse generator won't work.

1. In Vercel → your project → Settings → Environment Variables
2. Add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your Anthropic API key (get from console.anthropic.com)
   - Environment: Production, Preview, Development (check all 3)
3. Click "Save"
4. Go to Deployments → click the 3 dots → "Redeploy" to apply the key

### Step 5: Connect your domain aivaultco.com (10 min)

**In Vercel:**
1. Project → Settings → Domains
2. Add: `aivaultco.com`
3. Add: `www.aivaultco.com`
4. Vercel shows you DNS records to add — copy them

**DNS FIX for aivaultco.com:**

Your domain has an SSL error (TLS internal error). This means DNS is pointing somewhere broken.
The fix is to point it to Vercel.

Go to wherever you manage aivaultco.com DNS (GoDaddy, Namecheap, Cloudflare, etc):

DELETE any existing A records or CNAME records for @ (root) and www.

ADD these new records:

| Type  | Name | Value                  |
|-------|------|------------------------|
| A     | @    | 76.76.21.21            |
| CNAME | www  | cname.vercel-dns.com   |

Or if your registrar supports ALIAS/ANAME records:
| Type  | Name | Value              |
|-------|------|--------------------|
| ALIAS | @    | cname.vercel-dns.com |
| CNAME | www  | cname.vercel-dns.com |

Wait 5–60 minutes for DNS to propagate.
Vercel handles SSL certificates automatically — the SSL error will fix itself.

---

## PROJECT STRUCTURE

```
excuse-machine/
├── api/
│   └── excuse.js        ← Vercel serverless function (keeps API key secret)
├── public/
│   └── index.html       ← HTML shell
├── src/
│   ├── App.js           ← Main React app
│   └── index.js         ← React entry point
├── .gitignore
├── package.json
├── vercel.json          ← Vercel config
└── README.md
```

---

## HOW IT WORKS

1. User visits aivaultco.com
2. React app loads in their browser
3. User picks category + urgency → clicks Generate
4. Browser sends POST to /api/excuse
5. Vercel runs api/excuse.js on the server
6. Server calls Anthropic API with your secret key
7. Returns excuse text to browser
8. User sees their excuse

The API key NEVER touches the browser. It lives only in Vercel environment variables.

---

## STRIPE PAYMENT LINKS (already configured)

Starter 5 credits $0.99: https://buy.stripe.com/aFadRb8VSgAd97E2n8frW0b
Pro 20 credits $2.99:     https://buy.stripe.com/14A7sN6NKes5cjQ7HsfrW0c
Mega 60 credits $6.99:    https://buy.stripe.com/6oU8wRb40abP83AbXIfrW0d

After purchase, Stripe redirects to:
https://aivaultco.com/?pkg=starter (or pro or mega)

The app reads the ?pkg= param and adds credits automatically.

To enable redirect: In Stripe Dashboard → Payment Links → each link → Edit → After payment → Redirect to URL:
- Starter: https://aivaultco.com/?pkg=starter
- Pro:     https://aivaultco.com/?pkg=pro
- Mega:    https://aivaultco.com/?pkg=mega

---

## ENVIRONMENT VARIABLES

| Variable           | Where to get it              | Required |
|--------------------|------------------------------|----------|
| ANTHROPIC_API_KEY  | console.anthropic.com → Keys | YES      |

---

## LOCAL DEVELOPMENT (optional)

1. Create `.env.local` file with: `ANTHROPIC_API_KEY=your_key_here`
2. `npm install`
3. `npm start`
4. Open http://localhost:3000

Note: Vercel serverless functions need `vercel dev` to run locally.
Install: `npm i -g vercel` then run `vercel dev` instead of `npm start`
