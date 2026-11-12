# Kerala Civic Atlas redesign notes

## Source inspected
The uploaded Premium v3 archive was extracted and inspected. It contains a Vite/React frontend, a Three.js district scene, shared UI/motion components, Express API, Prisma/PostgreSQL schema and migrations, AI analysis integration, PWA files, documentation and SVG scenery components.

## Major visual changes
- Replaced the previous split hero with a full-width, map-led Civic Atlas composition.
- Expanded the Three.js Kerala scene into the primary visual stage, with map metadata, controls guidance, district selection rail and district information panel.
- Added a coordinated emerald/forest/ivory/kasavu-gold design system.
- Refined the navigation, language controls, buttons, district chips, cards, department directory, CTA, forms, tracking detail, dashboard tables, statistics and copilot surfaces.
- Added entrance motion, animated atmospheric lighting, map reveal, selected-district panel reveal, scroll cues, hover states and scroll-reveal transitions.
- Added responsive tablet/mobile compositions and reduced-motion handling.

## Functionality preservation
The existing `App` state, route switching, auth calls, grievance APIs, submission FormData, tracking, dashboard actions, AI copilot, PWA registration, shared components and backend files were not replaced. The home hero continues to use the existing `KeralaScene`, `sampleFor`, `SAMPLE_WEIGHTS` and `DISTRICTS` contracts.

## Known limitations
- The source ZIP did not include `client/public/kerala-districts.geojson`. The Three.js scene continues to try local data, then configured remote sources, then a clearly labelled stylised fallback. This build does not claim an offline authoritative GIS layer.
- Homepage and per-district example statistics remain demo values, explicitly labelled sample/illustrative.
- Gemini analysis needs `GEMINI_API_KEY`; otherwise the server reports its clearly labelled local keyword fallback.
- No official government affiliation is implied.

## Verification performed
- Source archive integrity checked before extraction.
- Required source component files confirmed present.
- Local import paths in `main.jsx` checked.
- CSS brace balance checked after the redesign.
- Final ZIP integrity check performed.
- A full Vite production build and live API/database regression suite could not be executed in this environment because dependencies/network are unavailable here. Run the setup and smoke tests on the target Windows machine before submission.


## Reference-led editorial redesign (TOAZ visual reference)
The public homepage now follows a premium, chapter-based storytelling rhythm inspired by the supplied TOAZ website: numbered content chapters, strong editorial headings, alternating full-width visual/text compositions, refined feature tiles, clear CTA hierarchy, expandable FAQ content and a more complete footer journey. The reference is a beverage-brand landing page, so commerce-specific elements (pricing/subscriptions, product benefits, product testimonials and purchase links) were not copied. They were translated into relevant civic-service equivalents: a searchable service finder, citizen access pathways, accountability principles, grievance lifecycle, help centre FAQs and contact/support actions.

No TOAZ text, logo, product photography, testimonials or brand assets are reused. The portal retains its own Kerala Civic Atlas identity and the required prototype disclaimer.

## Cinematic edition (latest)
- New `client/src/Cinematic.jsx` + `cinematic.css` replace the home page: session preloader with curtain reveal, masked-line mega headline, parallax hero, district marquee, scroll-lit paragraph, live 3D atlas with district panel, pinned horizontal scroll journey, department rows, count-up numbers, testimonial marquee, full-bleed finale, Lenis smooth scroll, scroll progress bar and custom cursor.
- Optional real photos: put hero.jpg, end.jpg, munnar.jpg, alleppey.jpg, kochi.jpg, kovalam.jpg in `client/public/images/` (licensed or free-to-use only, credit them). Missing files fall back to the built-in SVG scenery.
- New dependency: `lenis` (run `npm install` in client/).
- Inspired by the interaction style of toaz.in; no code, images or copy were copied from it.


## Premium typography and district navigation update — 12 November 2026
The cinematic homepage was refined after visual review. The large outlined district marquee has been replaced by a responsive district directory with selectable district entries. The oversized bold accountability paragraph is now a smaller editorial section with a serif headline, concise introduction and three traceability principles. Display typography now uses regular-weight Instrument Serif, while Public Sans remains the body face. The evergreen, ivory and muted-gold palette is retained with lighter borders and more restrained surfaces. Existing React routes, API integrations, Three.js district component and grievance workflows were not intentionally changed.
