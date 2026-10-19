# NO SIGNAL — Internet Observatory

**See the internet breathe.** Evidence-first monitoring of internet outage detections, official cloud/service incident reports and registry network resources, with interactive educational labs.


## What's included

- **Overview** — IODA country alerts, official status-page incident totals, transparent source response count.
- **Global Map** — interactive SVG map of 177 countries; highlights *detected country-level alerts*, not universal network health. 24h, 72h and 7-day observation windows.
- **Outage Center** — unified source-linked timeline of IODA detection records and unresolved official service incidents.
- **Network Atlas** — RIPEstat country resource inventory: ASN allocations, IPv4 blocks/ranges and IPv6 prefixes.
- **Route Explorer** — great-circle distance and ideal physical lower bound on fiber round-trip latency, **not actual network routing**.
- **Signal Labs** — live interactive *simulations* of latency, packet loss and the DNS → connection → TLS → HTTP → render flow.
- **GR / EN**, dark responsive interface, country drawer, mobile navigation, status indicators, auto-refresh, and simulation mode.

## Data provenance

| Service | Endpoint | Authentication | Semantics |
|---|---|---|---|
| IODA (Georgia Tech) | `https://api.ioda.inetintel.cc.gatech.edu/v2/outages/alerts` | No key in basic public API | Detection records, not proof of root cause or coverage |
| Cloudflare Status | `https://www.cloudflarestatus.com/api/v2/summary.json` | None | Official self-reported service status |
| GitHub Status | `https://www.githubstatus.com/api/v2/summary.json` | None | Official self-reported service status |
| Vercel Status | `https://www.vercel-status.com/api/v2/summary.json` | None | Official self-reported service status |
| OpenAI Status | `https://status.openai.com/api/v2/summary.json` | None | Official self-reported service status |
| RIPEstat | `https://stat.ripe.net/data/country-resource-list/data.json?resource=GR` | None | Registry data, not active route counts |

**Key caveats:**

- Zero alerts is **not** evidence a country's internet is healthy.
- Monitored status pages cover selected services only. They are not comprehensive outage maps.
- IODA data and provider reports can be delayed; incidents can overlap and should not be counted as unique outages.
- The map's base world shapes are contextual, and the network route lab uses a simplified theoretical propagation formula, not real traceroute hops.
- The **Simulation** toggle creates fictional examples *only* for UI testing, visibly labeled throughout the application. Live mode never quietly falls back to fake incidents.
- Country-to-resource data uses country registry metadata, which need not equal currently active networks in that location.
- When source APIs do not respond, the app displays `UNKNOWN` / `—`, not a fabricated green status.

## Run locally (no npm dependencies)

**Requires Node.js 20+.**

```bash
npm run dev
```

Open **http://localhost:3000**. The local server implements the same two API routes as Vercel, so public APIs can be tested from the local backend. Click **TRY DEMO** if the network is blocked or a source is temporarily unavailable.

Quality checks:

```bash
npm run check
```

This checks JavaScript syntax and integration logic using offline mock upstreams.

## Deploy to GitHub + Vercel

1. Create an empty GitHub repository, e.g. `no-signal`.
2. Upload **all the files at the root**, keeping `api/`, `lib/` and `assets/` directories.
3. In Vercel choose **Add New → Project → Import Git Repository**.
4. Select **Framework Preset: Other** (this is a zero-build static + serverless Node project).
5. **Root Directory:** `./` · **Build Command:** none · **Output Directory:** leave unset/empty. Vercel serves root `index.html` and `/api/*.js` functions.
6. Deploy. No environment variables required for the initial version.

### Deploy with CLI (optional)

```bash
npm i -g vercel
vercel
vercel --prod
```

No external APIs are called from the user's browser: the backend fetches them server-side and returns a normalized, cached response. Backend timestamps and source availability are exposed to the UI. API routes are read-only with no key storage.

## Files

```text
index.html              Main UI
styles.css              Responsive theme & interaction styles
app.js                  Routing, charts, map interaction, translations, labs
assets/world.svg        Embedded Natural Earth low-resolution world boundaries
assets/centroids.json   Geographic approximations for interactive markers
assets/countries.json   Country metadata
assets/favicon.svg      Brand icon
api/overview.js         IODA alerts + official provider Statuspage aggregation
api/country.js          Country registry resources via RIPEstat
lib/sources.js          Safe normalization, allowlisted service URLs, timeouts
local-server.js         Local Node preview server
vercel.json             Serverless caching + HTTP headers
package.json            Scripts without third-party runtime packages
tests/api.test.js       Offline integration tests
```

## Next iterations

1. Historical event storage (Postgres/Supabase) and time-scrubber that never confuses current status with history.
2. Deep links to individual IODA alert records and evidence/source trace.
3. Public RIPE Atlas sample measurements by probe/measurement ID (label geography and limited probe coverage explicitly).
4. BGP topology and route exploration using measured hops where available; no fabricated packet route lines.
5. Opt-in favorites, alert watchlists and ONE / MARIOS OS bridge with a source-age-aware notification policy.

## Licenses and attribution

- RIPE NCC / RIPEstat — source link and methodology in UI; check usage policies before commercial distribution.
- Georgia Tech IODA — source link and methodology in UI; check rate limits and attribution terms.
- Base country boundaries: `naturalearth_lowres` sample world geometry derived from [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/) (public domain).
- Application source is supplied for customization. No brand or icon assets from providers are bundled.

**Note:** The project was verified with offline integration tests and browser simulation mode. Live third-party APIs could not be queried from the build environment; verify network access and provider payloads after deployment.
