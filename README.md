# ExcuseMachine™ — Deployment Ready

## ✅ Stripe is already set up
All 3 payment links are live and baked into the app:
- Starter (5 credits) — $0.99
- Pro (20 credits) — $2.99
- Mega (60 credits) — $6.99

---

## 🚀 Deploy in 2 steps (5 minutes total)

### STEP 1 — Push to GitHub
1. Go to https://github.com → New repository
2. Name it: `excuse-machine` → Public → Create
3. Click "uploading an existing file"
4. Drag ALL files from this folder (package.json, vercel.json, src/, public/)
5. Click: Commit changes

### STEP 2 — Deploy on Vercel
1. Go to https://vercel.com → Sign up with GitHub
2. Click: Add New → Project
3. Import `excuse-machine`
4. Click: Deploy (no settings to change)
5. Live in ~60 seconds at https://excuse-machine.vercel.app

---

## 🌐 Connect aivaultco.com (10 min)

**In Vercel:** Settings → Domains → Add `aivaultco.com`
Vercel gives you DNS records to add.

**In Ionos:**
1. my.ionos.com → Domains → aivaultco.com → DNS
2. Delete old A records
3. Add:
   - Type: A | Host: @ | Value: 76.76.21.21 | TTL: 3600
   - Type: CNAME | Host: www | Value: cname.vercel-dns.com | TTL: 3600
4. Save → wait 5–15 minutes

---

## 💰 What's automated
- Stripe collects money and deposits to your bank
- Credits delivered instantly when user returns from Stripe
- 3 free trials before paywall appears
- AI generates premium excuses via Claude API
- All excuses watermarked with aivaultco.com
- Full purchase history stored in browser

© 2025 AIVaultCo · ExcuseMachine™
