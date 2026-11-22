#!/usr/bin/env python3
"""
Rebuilds the data behind Access Finder and Digital Readiness Profile.

Writes:
  js/country-data.js   one record per Joshua Project country: JP counts + World Bank indicators
  js/passport-data.js  entry requirements, 199 passports x 199 destinations

Reads:
  js/people-groups.js            Joshua Project AllPeoplesInCountry export already on the site
  scripts/country-crosswalk.csv  JP country code (ROG3) to ISO 3166 alpha-3
  Passport Index data (GitHub, MIT license) and the World Bank API, over the internet

Run from the repo root:  python3 scripts/refresh_data.py
The GitHub Action in .github/workflows/refresh-data.yml runs this monthly.

Standard library only, so it runs anywhere with Python 3.8+.
If a download fails, the script keeps the values already in the data files
instead of wiping them, and says so in its output.
"""
import csv, io, json, os, re, sys, urllib.request
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)

PASSPORT_BASE = "https://raw.githubusercontent.com/imorte/passport-index-data/main/"
PASSPORT_SOURCE = "Passport Index data (github.com/imorte/passport-index-data, MIT), scraped from passportindex.org"
WB_API = "https://api.worldbank.org/v2/country/all/indicator/{ind}?format=json&per_page=20000&date=2000:{y}"
WB_INDICATORS = {
    "net": ("IT.NET.USER.ZS", "Individuals using the Internet (% of population)"),
    "mob": ("IT.CEL.SETS.P2", "Mobile cellular subscriptions (per 100 people)"),
    "lit": ("SE.ADT.LITR.ZS", "Literacy rate, adult total (% of people ages 15 and above)"),
    "urb": ("SP.URB.TOTL.IN.ZS", "Urban population (% of total population)"),
    "mig": ("SM.POP.TOTL.ZS", "International migrant stock (% of population)"),
}

# Joshua Project thresholds (joshuaproject.net/global and /frontier):
#   Unreached: Evangelical <= 2% AND Professing Christian <= 5%
#   Frontier:  Professing Christian <= 0.1% (JP also requires no confirmed movement;
#              that field is not in this export, so this is the percentage test only)
UR_EV, UR_ADH, FR_ADH = 2.0, 5.0, 0.1

# Passport Index status -> one character. Stay length goes in a parallel grid (dm).
DAYS = [7, 10, 14, 15, 21, 28, 30, 31, 42, 45, 60, 90, 120, 150, 180, 240, 360]
REQ = {"visa free": "F", "visa on arrival": "A", "eta": "T",
       "e-visa": "E", "visa required": "R", "no admission": "N"}


def fetch(url, timeout=60):
    req = urllib.request.Request(url, headers={"User-Agent": "4thenations-data-refresh"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8")


def read_js_object(path, var):
    """Return the JSON object assigned to window.<var> in a generated data file, or None."""
    if not os.path.exists(path):
        return None
    m = re.search(r"window\." + var + r"\s*=\s*(\{.*\});?\s*$", open(path, encoding="utf-8").read(), re.S)
    return json.loads(m.group(1)) if m else None


def write_js(path, var, header, obj):
    body = json.dumps(obj, ensure_ascii=False, separators=(",", ":"))
    with open(path, "w", encoding="utf-8") as f:
        f.write(header.rstrip() + "\nwindow." + var + " = " + body + ";\n")


# ---------------------------------------------------------------- Joshua Project
def jp_counts():
    s = open(P("js", "people-groups.js"), encoding="utf-8").read()
    ctry = json.loads(re.search(r"c:\s*(\[.*?\])", s, re.S).group(1))
    lines = json.loads(re.search(r'p:\s*("(?:[^"\\]|\\.)*")', s, re.S).group(1)).split("\n")
    num = lambda x: None if x == "" else float(x)
    out = {}
    for i, c in enumerate(ctry):
        out[c.split("|")[1]] = {"groups": 0, "pop": 0, "ur": 0, "urPop": 0, "fr": 0, "frPop": 0, "noFig": 0}
    for line in lines:
        a = line.split("|")
        rog = ctry[int(a[1])].split("|")[1]
        pop, adh, ev = num(a[4]) or 0, num(a[5]), num(a[6])
        r = out[rog]
        r["groups"] += 1
        r["pop"] += pop
        if adh is None:
            r["noFig"] += 1
            continue
        # Evangelicals are a subset of Christian adherents, so a missing Evangelical
        # figure is no barrier when adherents are at or under 2%.
        if ev is None:
            if adh <= UR_EV:
                ev = adh
            elif adh <= UR_ADH:
                r["noFig"] += 1   # between 2% and 5% adherents: cannot tell without Evangelical %
                continue
            else:
                continue          # over 5% adherents: not unreached either way
        if ev <= UR_EV and adh <= UR_ADH:
            r["ur"] += 1; r["urPop"] += pop
            if adh <= FR_ADH:
                r["fr"] += 1; r["frPop"] += pop
    for r in out.values():
        for k in ("pop", "urPop", "frPop"):
            r[k] = int(round(r[k]))
    return out, len(lines)


# ---------------------------------------------------------------- World Bank
def world_bank(isos, previous):
    year = date.today().year
    wb, ok = {}, []
    for key, (ind, _) in WB_INDICATORS.items():
        try:
            rows, page, pages = [], 1, 1
            while page <= pages:
                data = json.loads(fetch(WB_API.format(ind=ind, y=year) + "&page=%d" % page))
                if not isinstance(data, list) or len(data) < 2 or data[1] is None:
                    raise ValueError("unexpected response: %s" % str(data)[:200])
                pages = int(data[0].get("pages", 1)); rows += data[1]; page += 1
            best = {}
            for r in rows:
                iso, v = r.get("countryiso3code"), r.get("value")
                if iso in isos and v is not None:
                    y = int(r["date"])
                    if iso not in best or y > best[iso][1]:
                        best[iso] = (round(float(v), 1), y)
            for iso, vy in best.items():
                wb.setdefault(iso, {})[key] = list(vy)
            ok.append(key)
            print("World Bank %s: %d countries" % (ind, len(best)))
        except Exception as e:
            print("World Bank %s FAILED (%s). Keeping previous values." % (ind, e))
            for iso, prev in (previous or {}).items():
                if key in prev:
                    wb.setdefault(iso, {})[key] = prev[key]
    return wb, ok


# ---------------------------------------------------------------- Passports
def passports(previous):
    try:
        full = json.loads(fetch(PASSPORT_BASE + "passport-index.json"))
        t2 = list(csv.reader(io.StringIO(fetch(PASSPORT_BASE + "passport-index-tidy-iso2.csv"))))[1:]
        t3 = list(csv.reader(io.StringIO(fetch(PASSPORT_BASE + "passport-index-tidy-iso3.csv"))))[1:]
        readme = fetch(PASSPORT_BASE + "README.md")
    except Exception as e:
        print("Passport data FAILED (%s). Keeping previous file." % e)
        return previous
    iso3 = {}
    for a2, a3 in zip(t2, t3):          # the two tidy files list the same rows in the same order
        iso3[a2[0].upper()] = a3[0]; iso3[a2[1].upper()] = a3[1]
    m = re.search(r"Last updated:\s*\**([^*\n]+)", readme)
    updated = m.group(1).strip().rstrip(".") if m else "unknown"
    codes = sorted(set(iso3.values()))
    idx = {c: i for i, c in enumerate(codes)}
    grid = [["?"] * len(codes) for _ in codes]
    dgrid = [["."] * len(codes) for _ in codes]
    unknown, odd_days = set(), set()
    for p2, dests in full.items():
        pi = idx[iso3[p2.upper()]]
        grid[pi][pi] = "-"
        for d2, v in dests.items():
            di = idx[iso3[d2.upper()]]
            st = (v.get("status") or "").strip().lower() if isinstance(v, dict) else ""
            ch = REQ.get(st)
            if ch is None:
                unknown.add(st); ch = "R"
            grid[pi][di] = ch
            days = v.get("days") if isinstance(v, dict) else None
            if days is not None:
                if days in DAYS:
                    dgrid[pi][di] = chr(97 + DAYS.index(days))
                else:
                    odd_days.add(days)
    if unknown:
        print("Unknown status values treated as visa required:", sorted(unknown))
    if odd_days:
        print("Stay lengths not in DAYS, left blank (add them to DAYS):", sorted(odd_days))
    print("Passports: %d x %d, updated %s" % (len(codes), len(codes), updated))
    return {"v": 2, "updated": updated, "source": PASSPORT_SOURCE, "days": DAYS, "codes": codes,
            "m": ["".join(r) for r in grid], "dm": ["".join(r) for r in dgrid]}


# ---------------------------------------------------------------- main
def main():
    xw = list(csv.DictReader(open(P("scripts", "country-crosswalk.csv"), encoding="utf-8")))
    jp, n_groups = jp_counts()
    prev_c = read_js_object(P("js", "country-data.js"), "CN_COUNTRIES") or {}
    prev_wb = {c["iso"]: c.get("wb", {}) for c in prev_c.get("list", [])}
    isos = {r["iso3"] for r in xw}
    wb, ok = world_bank(isos, prev_wb)

    countries = []
    for r in xw:
        rec = {"rog": r["rog3"], "iso": r["iso3"], "name": r["name"], "jp": jp[r["rog3"]]}
        if wb.get(r["iso3"]):
            rec["wb"] = wb[r["iso3"]]
        countries.append(rec)

    prev_meta = prev_c.get("meta", {})
    meta = {
        "built": date.today().isoformat(),
        "jp": {"source": "Joshua Project AllPeoplesInCountry export (js/people-groups.js)", "groups": n_groups,
               "rule": "Unreached: Evangelical <= 2% and Professing Christian <= 5%. Frontier: Professing Christian <= 0.1%."},
        "wb": {"source": "World Bank, World Development Indicators",
               "indicators": {k: {"id": v[0], "label": v[1]} for k, v in WB_INDICATORS.items()},
               "refreshed": date.today().isoformat() if ok else prev_meta.get("wb", {}).get("refreshed")},
    }
    header = ("/* GENERATED by scripts/refresh_data.py. Do not edit by hand; run the script\n"
              "   or the 'Refresh tool data' GitHub Action. One record per Joshua Project country.\n"
              "   jp: groups, pop, ur (unreached groups), urPop, fr (Frontier groups), frPop, noFig (cannot classify: figure missing)\n"
              "   wb: indicator -> [value, year], latest year with a value since 2000 */")
    write_js(P("js", "country-data.js"), "CN_COUNTRIES", header, {"meta": meta, "list": countries})
    print("Wrote js/country-data.js: %d countries, %d with World Bank data" % (len(countries), len(wb)))

    pp = passports(read_js_object(P("js", "passport-data.js"), "CN_PASSPORT"))
    if pp:
        header = ("/* GENERATED by scripts/refresh_data.py. Entry requirements by passport (row)\n"
                  "   and destination (column), ISO alpha-3 codes in 'codes'.\n"
                  "   m:  F visa free, A visa on arrival, T electronic travel authorization, E e-visa,\n"
                  "       R visa required, N no admission, - own country, ? no data\n"
                  "   dm: stay length, a-q = days[0..16], . = not stated */")
        write_js(P("js", "passport-data.js"), "CN_PASSPORT", header, pp)
        print("Wrote js/passport-data.js")
    if len(ok) < len(WB_INDICATORS):
        print("NOTE: some World Bank indicators did not refresh; see messages above.")


if __name__ == "__main__":
    sys.exit(main())
