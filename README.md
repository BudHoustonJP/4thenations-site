# 4thenations.com

The interactive companion to **Clarity for the Nations** by Bud Houston. Every page is a self-contained, dependency-free HTML file (fonts from Google only). No build step.

## Pages (impact order)

| File | Live URL | Piece |
|------|----------|-------|
| `index.html` | `/` | Landing page, all 31 pieces in impact order |
| `uzbekistan-opening.html` | `/uzbekistan-opening.html` | Uzbekistan Is Opening |
| `operators-not-graduates.html` | `/operators-not-graduates.html` | Operators, Not Graduates |
| `japan-unreached.html` | `/japan-unreached.html` | The Japan Paradox (scroll) |
| `gospel-of-consumption.html` | `/gospel-of-consumption.html` | The Gospel of Consumption (Parts 1+2) |
| `asking-the-wrong-question.html` | `/asking-the-wrong-question.html` | Asking the Wrong Question |
| `multi-node-strategy.html` | `/multi-node-strategy.html` | Multi-Node Strategy (Jesus+Paul+Pattern) |
| `alevi-invisible-millions.html` | `/alevi-invisible-millions.html` | The Invisible Millions (Alevis) |
| `counting-what-counts.html` | `/counting-what-counts.html` | Counting What Counts |
| `world-isnt-what-you-think.html` | `/world-isnt-what-you-think.html` | The World Isn't What You Think |
| `christmas-and-the-nations.html` | `/christmas-and-the-nations.html` | Christmas and the Nations (Parts 1+2+3) |
| `following-the-funds.html` | `/following-the-funds.html` | Following the Funds |
| `why-mobilization-misses.html` | `/why-mobilization-misses.html` | Why Mobilization Misses the Real Barrier |
| `walking-through-open-doors.html` | `/walking-through-open-doors.html` | Walking Through Open Doors (Ramadan) |
| `why-leaders-dont-need-more-data.html` | `/why-leaders-dont-need-more-data.html` | Why Leaders Don't Need More Data |
| `why-mission-research-matters.html` | `/why-mission-research-matters.html` | Why Mission Research Matters |
| `when-the-homeland-is-unreachable.html` | `/when-the-homeland-is-unreachable.html` | When the Homeland Is Unreachable |
| `the-activity-trap.html` | `/the-activity-trap.html` | The Activity Trap |
| `young-americans-religion.html` | `/young-americans-religion.html` | What the Data Says About Young Americans |
| `ego-and-logo.html` | `/ego-and-logo.html` | Leave Your Ego and Logo at the Door |
| `every-map-has-a-fault.html` | `/every-map-has-a-fault.html` | Every Map Has a Fault |
| `labor-shortage.html` | `/labor-shortage.html` | The Labor Shortage |
| `turkmenistan-2026.html` | `/turkmenistan-2026.html` | Turkmenistan 2026 |
| `city-is-the-village.html` | `/city-is-the-village.html` | The City Is the Village |
| `four-questions.html` | `/four-questions.html` | The Four Questions |
| `the-watched-world.html` | `/the-watched-world.html` | The Watched World |
| `learn-to-exit.html` | `/learn-to-exit.html` | Learn to Exit |
| `with-therefore-sent.html` | `/with-therefore-sent.html` | With, Therefore Sent |
| `sea-of-plastic.html` | `/sea-of-plastic.html` | The Sea of Plastic |
| `geography-still-governs.html` | `/geography-still-governs.html` | Why Geography Still Governs |
| `migration-to-mobility.html` | `/migration-to-mobility.html` | From Migration to Mobility |
| `vision-for-vibes.html` | `/vision-for-vibes.html` | Have We Traded Vision for Vibes? |
| `japan-paradox.html` | `/japan-paradox.html` | Bonus: Japan Paradox vertical video page |
| `404.html` | `served automatically` | Friendly not-found page |
| `wrangler.jsonc` | `n/a` | Cloudflare Worker static-assets config |

## Hosting

Code lives in this GitHub repo and deploys automatically to Cloudflare on every commit. Static assets only; no build command. Worker deploy command: `npx wrangler deploy`, with `wrangler.jsonc` pointing at the repo root.

## Adding or updating a page

1. Add or edit the `.html` file in this repo (drag and drop in GitHub, then commit).
2. Add a matching card to `index.html`.
3. Commit. The site rebuilds and the change is live in about a minute.
