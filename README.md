# 4thenations.com

Source for **Clarity for the Nations**, Bud Houston's site for mission practitioners:
interactive articles, mission tools, Frontier Trail, and Work with Me.

Static HTML. Cloudflare publishes this repository on every commit (`wrangler.jsonc`).
`.assetsignore` keeps `scripts/`, `.github/`, and this README off the live site.

## How the site fits together

| Part | Where | Notes |
|---|---|---|
| Header, footer, nav | `js/shell.js`, `css/shell.css` | One file holds the navigation for every page. Mission tools are listed in its `TOOLS` array. |
| Page design | `css/site.css` | Night-map look: one accent color (lamp gold), Sofia Sans Extra Condensed, IBM Plex Sans and Mono. |
| Tool design | `css/tools.css` | Shared parts for the data tools: controls, result card, tables, legend. |
| Articles | `*.html`, `js/articles.js` | Interactive versions of Substack articles. |
| People group data | `js/people-groups.js` | Joshua Project AllPeoplesInCountry export. Used by the people search, the calculators, and the data tools. |

## Mission tools

| Tool | Page | Data |
|---|---|---|
| City Brutal Facts | `brutal-facts-calculator-cities.html` | Built in |
| People Segment Brutal Facts | `brutal-facts-calculator-segments.html` | `js/people-groups.js` |
| Where Is the Work? | `where-is-the-work.html` | `js/people-groups.js` |
| Access Finder | `access-finder.html` | `js/passport-data.js`, `js/country-data.js`, `js/map-cells.js` |
| Digital Readiness | `digital-readiness.html` | `js/country-data.js` |

## Data refresh

`.github/workflows/refresh-data.yml` runs `scripts/refresh_data.py` on the 1st of each month.
It rebuilds:

- `js/country-data.js`: Joshua Project counts per country (from `js/people-groups.js`) and World Bank indicators
- `js/passport-data.js`: entry rules for 199 passports (Passport Index data, MIT license)

Run it any time: **Actions > Refresh tool data > Run workflow**. Do not upload these two files by hand;
the Action owns them.

When a new Joshua Project export arrives, replace `js/people-groups.js`, then run the Action.

`scripts/build_map_cells.py` built `js/map-cells.js` once. Rerun it only if the map grid changes.

## Adding a page

1. Copy the head and body pattern from `tools.html`: fonts, `css/shell.css`, `css/site.css`, and the two `js/shell.js` lines.
2. For a new tool, add one line to `TOOLS` in `js/shell.js`. The nav, mobile menu, and footer update everywhere.

## Frontier Trail

The game's source and license live in its own repository, `frontier-trail-Public`. Edit there first,
then copy `index.html` here as `frontier-trail.html`.
