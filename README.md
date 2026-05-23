# Daily Stoic

[![CI Backend](https://github.com/jamesBoder/daily-stoic/actions/workflows/ci-backend.yml/badge.svg)](https://github.com/jamesBoder/daily-stoic/actions/workflows/ci-backend.yml)
[![CI Frontend](https://github.com/jamesBoder/daily-stoic/actions/workflows/ci-frontend.yml/badge.svg)](https://github.com/jamesBoder/daily-stoic/actions/workflows/ci-frontend.yml)
[![CD](https://github.com/jamesBoder/daily-stoic/actions/workflows/cd.yml/badge.svg)](https://github.com/jamesBoder/daily-stoic/actions/workflows/cd.yml)

> *"The happiness of your life depends upon the quality of your thoughts."*
> — Marcus Aurelius, probably not thinking about CI pipelines

Ancient wisdom from across the philosophical world — one passage a day, seven traditions, zero algorithmic noise.

**Live at [dailyxam.com](https://dailyxam.com)**

## Stack

| Layer | Tech |
|---|---|
| Backend | Go 1.24 · Gin · GORM · PostgreSQL + pgvector |
| Frontend | React · TypeScript · Vite · Tailwind CSS |
| Auth | JWT · Google OAuth |
| Payments | Stripe |
| Deploy | Fly.io (backend + DB) · AWS S3 + CloudFront (frontend) |

## Running Locally

```bash
# Start the database and backend
docker compose up --build -d

# Start the frontend
cd frontend && npm install && npm start
```


## Features

**The Daily Practice**
- A new passage every morning drawn from philosophers across seven traditions — selected deterministically, never randomly
- Weekly rotating theme (Resilience, Virtue, Impermanence, …)

**The Library**
- Seven philosophical traditions: Stoic, Hermetic, Neoplatonic, African, Renaissance, Transcendentalist, and more
- Author profile pages — philosopher biographies, full passage archives, commentary and reflection prompts
- Structured reading plans: *30-Day Stoic Virtues*, *49-Day Hermetic Principles*, and counting
- Tradition Browser with premium-gated content

**The Oracle Card**
- Each quote rendered as an esoteric oracle card — woodcut-style illustration, inner frame, corner ornaments, thematic medallion
- Swipe left to save; lazy-loaded with a parchment-tint placeholder

**Ask the Philosopher** *(powered by Claude)*
- Pose a question and receive a response in the authentic voice of the philosopher you're reading — grounded in their actual writings
- Free users: 3 questions/day. Practitioner: unlimited
- Available on the daily quote, any passage card, author pages, and the dedicated `/converse` page

**Confluence** *(daily game)*
- A new puzzle every day: 16 face-down philosophical concept cards, 4 hidden groups of 4 — find the connections across traditions
- Playable without an account; authenticated users get server-persisted sessions and earn cards for their personal Library
- Share your result as an emoji grid (à la Wordle, but the words are harder and Plotinus wrote them)

**The Essentials**
- Guest mode — daily quote visible without an account
- Favorites, reading history, and comments
- Share to Twitter/X, WhatsApp, Instagram, or native OS share sheet
- Google OAuth + email/password auth

**Tiers**
| | Free | Practitioner ($14.99 lifetime) |
|---|---|---|
| Daily quote | ✓ | ✓ |
| Stoic tradition | ✓ | ✓ |
| Premium traditions (Hermetic, Neoplatonic, …) | — | ✓ |
| Ask the Philosopher | 3/day | Unlimited |
| Ad-free | — | ✓ |

## Philosophy

Across every tradition in this app — Stoic, Hermetic, Neoplatonic, African, Renaissance — the philosophers agree on one thing: the unexamined life is not worth living. What's up to us: the quality of this code, the clarity of this UI, the consistency of these deploys. What's not: whether you'll actually sit with the passage. That part's on you.

## License

MIT © 2026 James Boder

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
