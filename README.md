# CM Kerala – Public Grievance Redressal Portal

A recruitment-assessment prototype implementing a citizen grievance portal, CMO administration workflow, department officer queue and AI-assisted grievance suggestions. **This is not an official Government of Kerala or Chief Minister's Office service. Use fictional data only.**

## Enhanced civic experience
- Premium editorial homepage refinement: lighter Instrument Serif display typography, a selectable 14-district directory, and a compact accountability chapter in place of the oversized district ticker and heavy scroll paragraph.
- Interactive Kerala district selector with all 14 district names; selection can prefill grievance submission. The map is an illustrative SVG selector, not an authoritative GIS boundary map.
- Citizen assistance copilot that calls the existing AI analysis API and shows advisory category, department and priority suggestions. Gemini requires `GEMINI_API_KEY`; otherwise a clearly labelled keyword fallback is returned.
- Grievance lifecycle stepper alongside chronological case history.
- Role-aware workspace overview, live refresh, client-side search across reference/subject/district/department, CSV export of the currently filtered records, CMO status-distribution chart and recent activity feed.
- PWA manifest, service-worker app-shell caching and browser install prompt. API operations remain online-only; this is not offline grievance submission.

## Features
- Public pages: Home, About, How It Works, Departments, Contact and FAQ.
- Interactive Kerala district explorer with selectable district markers and a district-chip directory (illustrative interface, not a GIS boundary map).
- Floating citizen-assistance copilot that calls the grievance analysis API and can carry suggestions into the grievance form.
- Visual grievance progress stepper alongside the timestamped status history.
- Installable Progressive Web App shell with offline caching of the app shell; API actions still require connectivity.
- Citizen registration/login, grievance submission, reference IDs, tracking and history.
- CMO dashboard: list/filter, department assignment, priority, status changes and district chart.
- Department officer dashboard: assigned queue, investigation remarks, action-taken report and status updates.
- AI assistant: Gemini API integration when configured; clearly labelled local keyword fallback otherwise. AI suggestions never make official decisions.
- File uploads (up to 3 JPG/PNG/PDF files, 5 MB each), contact enquiries and citizen feedback API.
- JWT authentication, role checks, password hashing, rate limiting, Helmet and upload validation.

## Requirements
Node.js 20+, npm, PostgreSQL 14+.

## Run locally
1. Install PostgreSQL and create a database named `cmkerala`.
2. Copy `.env.example` to `server/.env` and set `DATABASE_URL`, `JWT_SECRET`, `CLIENT_ORIGIN`, and optionally `GEMINI_API_KEY`.
3. Install dependencies:
   ```bash
   npm install
   npm install --prefix server
   npm install --prefix client
   ```
4. Create database tables and seed demo accounts:
   ```bash
   cd server
   npx prisma generate
   npx prisma migrate dev --name init
   node prisma/seed.js
   cd ..
   ```
5. Start both apps from the project root:
   ```bash
   npm run dev
   ```
   The `predev` step attempts to download and cache Kerala district GeoJSON to `client/public/kerala-districts.geojson`. If the file already exists and validates, it is reused.
6. Create a production frontend build:
   ```bash
   npm run build
   ```
6. Open http://localhost:5173. API health check: http://localhost:5000/api/health.

## Demo credentials
All demo accounts use password `Demo@12345`:
- CMO admin: `admin@cmkerala.demo`
- Department officer (Public Works): `officer@cmkerala.demo`
- Citizen: `citizen@cmkerala.demo`

Seed data is fictional. Create a citizen account or log in as the demo citizen to submit a sample grievance.

## AI configuration
Set `GEMINI_API_KEY` in `server/.env` to enable Gemini 2.0 Flash grievance analysis. Without a key, the API returns a deterministic keyword-based fallback and explicitly labels it `Local keyword fallback (not AI)`. Do not describe fallback mode as completed AI integration. AI output is advisory and must be reviewed by CMO staff.

## Deployment outline
- Database: create a managed PostgreSQL database (for example Neon) and use its connection string as `DATABASE_URL`.
- API: deploy `server` as a Node web service. Set `PORT`, `DATABASE_URL`, `JWT_SECRET`, `CLIENT_ORIGIN`, and `GEMINI_API_KEY`. Run `npx prisma migrate deploy` as the release/build migration command and `node prisma/seed.js` only if demo accounts are required.
- Frontend: deploy `client` as a static Vite site. Set `VITE_API_URL` to the deployed API base URL ending in `/api`; build command `npm run build`, output directory `dist`.
- Ensure persistent storage or managed object storage for uploaded files before production use. The included local disk upload handler is suitable for a demo host with persistent disk, not ephemeral serverless storage.
- Verify CORS, HTTPS, database migrations, demo logins, file upload and the full workflow after deployment.

## Security and prototype limitations
This is an assessment prototype, not a production public-service system. Before real use, add email/OTP verification, password reset, stronger audit controls, antivirus scanning, private object storage with authorized downloads, retention policy, encryption/key management, accessibility and security testing, monitoring, backups, rate limits per user, and legal/privacy review. Public tracking exposes status history and should be reviewed for privacy before production. Do not enter real personal or sensitive citizen data.

## API overview
See `DOCUMENTATION/04_API_Documentation.md`.


## Added civic interface features
The district explorer is an illustrative, selectable district interface and must not be represented as an authoritative geographic/GIS map. The floating assistant uses `/api/ai/analyse`; set `GEMINI_API_KEY` in `server/.env` to use Gemini. Without a valid key, the server explicitly returns a local keyword fallback rather than claiming model-based AI. The PWA caches the app shell only; submitting, tracking, authentication and other API actions require an active connection.


## Geographic 3D GIS district explorer
The homepage map now renders extruded district polygon geometry with Three.js. Users can rotate it by dragging, zoom with the mouse wheel, and select a district polygon or district chip to prefill grievance submission. District geometry is loaded from the `india-maps-data` Kerala GeoJSON asset at runtime; an internet connection is required to fetch it on first load. The data repository states that its maps are curated from public sources and are for visualization, not an authoritative government survey record. See `DOCUMENTATION/08_GIS_Map.md` for source and limitations.


## Map-led animated homepage
The homepage hero now features the interactive 3D district GIS explorer as its primary visual instead of the static grievance lifecycle card. The map is rendered from district GeoJSON polygons with Three.js, extruded depth, district selection highlighting, gentle idle rotation, pointer rotation and wheel zoom. The selected district is passed into the citizen grievance form. The map loads external GeoJSON and therefore needs internet access. The map source is a visualization dataset and must not be represented as an official government survey boundary.


### GIS map dependency note
Three.js is explicitly imported by the GIS map component. The district boundaries are loaded from the community `geohacker/kerala` GeoJSON dataset using jsDelivr with GitHub Raw as fallback. Run `npm run install:all` to install the Three.js dependency and generate a fresh client lockfile. An internet connection is required for the district data; this is not an official government survey boundary.

## Frontend design notes
- **Visual identity:** backwater teal and monsoon mist, with a double gold rule borrowed from the border of Kerala's kasavu cloth. Fonts: Bricolage Grotesque (headings), Public Sans (body), Noto Sans Malayalam.
- **3D district map** (`client/src/KeralaScene.jsx`, Three.js): extruded district boundaries with hover lift, selection, drag-to-rotate and Ctrl+scroll zoom. Boundaries load from `client/public/kerala-districts.geojson` if present, then from the CDN sources. If neither is reachable it shows a labelled stylised district-tower view. Heights and the side panel use fictional sample figures.
- **Motion:** scroll-drawn grievance path, count-up statistics, card tilt, typed AI example. All motion respects `prefers-reduced-motion`.
- **Workflow additions:** grievance receipt screen with reference number, CMO filters (district, category, priority, status), overdue flag and an escalate action recorded in case history, star feedback, actor name in status history, English / Malayalam toggle for navigation and hero.
- Home page figures are sample data and labelled as such.

## Tools and services disclosure
Built with React, Vite, Three.js, Recharts, Lucide icons, Express, Prisma and PostgreSQL. Google Gemini API for AI analysis (optional). Boundary GeoJSON from the public geohacker/kerala repository. AI coding assistant (Claude) used for frontend redesign; all code reviewed and understood by the author.


## Kerala Civic Atlas — full homepage redesign
The homepage hero has been rebuilt as an immersive map-led experience rather than the previous two-column landing-page composition. The 3D Kerala scene now occupies a large, framed geospatial stage, with the citizen introduction and actions layered alongside it, a district selection rail, a district information panel, map controls guidance, and an animated civic-atlas atmosphere. Existing section content, navigation, citizen actions, copilot, page routes and backend interactions are retained.

The visual system now uses midnight emerald, forest green, warm ivory and restrained kasavu gold; a translucent fixed masthead; editorial serif display type; district intelligence labels; scroll reveal; and responsive/reduced-motion behavior. Existing sample counts and per-district figures remain explicitly illustrative and are not live public-service statistics.

### Geographic data status
`client/src/KeralaScene.jsx` loads local `/kerala-districts.geojson` first, then its configured public GeoJSON sources, and finally displays a clearly labelled stylised fallback. The uploaded source archive did not contain `client/public/kerala-districts.geojson`. This redesign package preserves that behavior rather than inventing official district polygons. For a fully offline geographical map, add a verified Kerala district GeoJSON file at `client/public/kerala-districts.geojson`. The currently configured external source is community-maintained; verify boundaries and licensing before official use.
