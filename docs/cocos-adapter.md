# Cocos city adapter

Start from the editor project directory with Node 22+: node tools/serve.mjs, then open http://127.0.0.1:8820.

The portable editor dist files can be hosted separately. Current project assets and the Save-to-Cocos bridge require this loopback server and the sibling three-kingdoms-city project. Static/file previews cannot write to a game project.

GET /api/projects/city returns a saved city-project.json when present, otherwise the current export from tools/export-city.mjs. Asset URLs point to the read-only project-assets route. The reference image is /project-assets/reference.png.

POST /api/projects/city/layout accepts validated JSON (5MB max), validates through dist/layout-core.mjs, and writes only city-project.json plus the fixed game assets/resources/layouts/city-layout.json. Only supported root-level city sprite and flag IDs can be applied. Host and Origin checks restrict the bridge to its loopback page. There are no destination paths or network URLs in the write API.

Rebuild the game after applying. LayoutBridge loads layouts/city-layout after CityGame builds its world and HUD. IDs are exact unique runtime sprite node names. Coordinates are top-left canvas coordinates in 1672×941; the bridge converts y-down coordinates to Cocos y-up center origin, negates clockwise rotation, applies size/anchor/scale/opacity/visibility and sibling order within the original parent layer. Existing non-sprite nodes remain present. Changing World versus HUD layer is not supported.

This adapter exposes 24 main sprite instances and nine editable flag text nodes. Resource text and HUD hit areas are linked companions; battle nodes are outside the city document. Building hit listeners are attached to their sprite and follow it. HUD sprite mappings also transform their linked resource labels and plus-hit areas, utility hit areas, navigation hit areas and campaign hit area. Positions, rotation, size-derived scale, visibility and opacity follow the authored artwork. Portrait has no input companion. Locked is an authoring property, not a runtime input lock.

For another engine implement a separate GET document exporter and explicit save adapter. The portable layout JSON and dist editor need no Cocos runtime dependencies. Asset manifests must provide image pixel sizes; export-city.mjs uses PNG IHDR dimensions and preserves runtime aspect-fit sizing.

A valid saved city document is authoritative: omitted supported sprite IDs become inactive, together with their HUD companions. Missing/unreadable layout assets preserve the default scene. Runtime z order remains within existing World and HUD parents; the adapter does not move artwork across those layers.
