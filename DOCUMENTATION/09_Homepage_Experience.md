# Homepage visual experience

## Hero redesign
The homepage's first-screen visual is now the interactive 3D district GIS map. The former static grievance lifecycle preview card has been removed from the hero. The hero uses a formal forest-green, ivory and restrained brass palette, a topographic contour treatment, subtle orbital motion and an animated map reveal.

## Map interactions
- District polygons are rendered as extruded Three.js meshes from Kerala GeoJSON.
- Users can drag to rotate, scroll to zoom, click polygons, or use the district chips.
- The selected district is highlighted and passed to the grievance form.
- The map gently rotates when idle and respects reduced-motion preferences for the decorative CSS effects.

## Limitations
- External GeoJSON must be fetched from the public CDN, so the map needs an internet connection.
- Data is a third-party visualization dataset, not an authoritative government GIS boundary dataset.
- The app remains an assessment prototype and must not be presented as an official Government of Kerala service.


## Premium editorial refinement (12 November 2026)
- Replaced the oversized outlined district ticker with a quiet, responsive 14-district directory. Each district entry is selectable and takes the visitor to the 3D atlas with that district selected.
- Replaced the full-width, extra-bold scroll-revealed accountability paragraph with a compact editorial section: a restrained serif heading, short explanatory copy and three concise accountability principles.
- Reduced the use of heavy display typography across the cinematic homepage. Display headings now use the Instrument Serif family with regular weight; body copy remains in Public Sans.
- Refined the palette toward warm ivory, deep evergreen and muted kasavu gold, with lighter borders and less rounded card treatment.
- Preserved the existing hero calls to action, district map component, process journey, department directory, navigation and backend workflows.
- The district snapshot counts shown beside the map remain illustrative sample values, not live official statistics. The map still depends on local or remote GeoJSON; if no valid boundary data is available, the existing labelled fallback is used.
