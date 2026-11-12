# Kerala 3D GIS District Explorer

The homepage district explorer now uses district polygon geometries from the `kerala.geojson` asset in the `udit-001/india-maps-data` repository. The component renders those polygon rings as extruded Three.js meshes, rather than drawing a stylised state silhouette.

## Interactions
- Drag the map to rotate the 3D model.
- Scroll over the map to zoom.
- Select a district polygon or use a district chip to select it.
- Selecting a district carries its name to the grievance submission form.

## Data source and limitations
- Dataset URL: https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@main/geojson/states/kerala.geojson (with raw GitHub fallback)
- Repository: https://github.com/udit-001/india-maps-data
- The repository describes the data as curated from publicly available sources and intended for visualization. It is not an official Government of Kerala or Survey of India boundary dataset.
- The map requires internet access to fetch the GeoJSON on first load. API submission and tracking remain online-only.
- Verify boundaries against an authoritative government GIS source before any administrative, legal or official use.

## Dependency
Three.js is added to `client/package.json`. Run `npm run install:all` after extracting the updated project, then `npm run db:generate --prefix server` and `npm run dev`.


## Final map runtime correction
- Three.js is explicitly imported in `client/src/main.jsx` (`import * as THREE from 'three'`).
- District GeoJSON source URLs now use the `geohacker/kerala` repository's `geojsons/district.geojson` asset, with jsDelivr and GitHub raw endpoints as fallbacks.
- The GeoJSON features use the `DISTRICT` property and are matched against Kerala's 14 district names.
- The map still needs an internet connection to retrieve the external boundary data. The dataset is community-maintained visualization data and is not an authoritative government survey boundary.


## Automatic local caching
The root project now has a `predev` hook and `gis:download` command backed by `scripts/download-kerala-gis.mjs`. On first development startup it attempts to download the community Kerala district GeoJSON into `client/public/kerala-districts.geojson`, validates that at least ten known Kerala district features are present, and reuses the local file on subsequent starts. If the download cannot be completed, the Three.js component retains its existing external-source attempts and clearly labelled stylised fallback. No fabricated district polygons are bundled or represented as authoritative.
