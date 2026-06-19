# 4thenations.com

The interactive companion to **Clarity for the Nations**, the Substack by Bud Houston. Each page is a self-contained, dependency-free HTML file. The site is plain static HTML, so there is no build step.

## Pages

| File | Live URL | What it is |
|------|----------|------------|
| `index.html` | `/` | Landing page linking to every piece |
| `japan-paradox.html` | `/japan-paradox.html` | Video-style vertical sequence: the Japan Paradox |
| `alevi-invisible-millions.html` | `/alevi-invisible-millions.html` | Scroll story: Turkey's hidden Alevi millions |
| `404.html` | served automatically | Friendly not-found page |

## How it is hosted

- Code lives in this GitHub repository.
- Cloudflare Pages is connected to the repo and redeploys automatically on every commit.
- Build command: none. Build output directory: `/` (root).
- The domain 4thenations.com is connected through Cloudflare with free SSL.

## How to add or update a page

1. Add the new `.html` file to this repository (drag and drop in the GitHub web interface, then commit), or edit an existing file.
2. Add a matching card to `index.html` so the new piece appears on the landing page.
3. Commit. Cloudflare Pages rebuilds and the change is live in about a minute.

That is the whole workflow. No servers to manage, nothing to restart.
