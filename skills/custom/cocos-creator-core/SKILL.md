---
name: cocos-creator-core
description: Build and debug Cocos Creator 3.x TypeScript components, scenes, prefabs, UI and asset import/loading. Use for Cocos Creator, imports from cc, SpriteFrame, Asset Bundle, missing artwork or Creator preview/build issues.
---

# Cocos Creator Core

Target Cocos Creator **3.8 LTS** documentation. Preserve an existing project's exact
editor version. Creator 2.x and Cocos2d-x require separate documentation; do not mix
cc.Class or cc.loader with Creator 3.x APIs.

## Workflow

1. Inspect package.json (creator.version), assets/, settings/, scenes and scripts
   importing from cc. Confirm the selected editor version. Generic TypeScript or an
   arbitrary project.json is insufficient to identify Creator.
2. Read the affected scene/prefab and adjacent scripts. Preserve asset .meta UUIDs;
   move assets with metadata, preferably in the editor. Never fabricate scene UUIDs
   or regenerate existing metadata to repair references.
3. Use named imports from cc, _decorator, @ccclass and typed @property references.
   Bind references in Inspector. Initialize in onLoad, pair listeners in onEnable
   and onDisable, and use update(dt) for frame-rate-independent motion.
4. Bind UI concepts to Canvas, UITransform, Widget and Layout; spawning to Prefab
   and instantiate; animation to Animation or tween. Match the project's 2D/3D
   physics backend. Do not directly reposition a dynamic physics body each frame.
5. For artwork compose with create-game-assets and read
   [art import](references/art-import.md). Prefer Inspector references for static
   assets; use resources.load only under assets/resources, otherwise use the
   project's Asset Bundle strategy. Guard async callbacks against destroyed nodes
   and stale requests. Release owned assets only after their consumers stop using
   them; do not force-release shared textures.
6. Open the scene in the matching editor, check missing components and references,
   preview the interaction and inspect Console. Build the requested target using
   existing project settings and smoke-test its output. TypeScript checks alone
   cannot validate serialized scene wiring. Report unavailable editor/target checks.

## Pitfalls

- Missing sprite: inspect SpriteFrame, active hierarchy, UI size, opacity and
  camera/layers before regenerating artwork.
- Repeated input after reopening UI: remove listeners with the same callback and
  target used when registering. Avoid unremovable anonymous listeners.
- Broken reference after rename: restore original metadata and inspect UUID links.
- Browser success with mini-game failure: check platform APIs, package limits,
  bundles and platform logs; browser preview is not target validation.

## Composition and sources

Bind genre examples to Creator APIs, never load Godot/Unity APIs as substitutes.
Add input-systems, game-ui-ux, save-systems or game-feel only as needed. Advanced
shaders, networking, native plugins and platform SDKs need version-matched official
sources and project evidence; this core skill does not supply those backends.

- [Lifecycle](https://docs.cocos.com/creator/3.8/manual/en/scripting/life-cycle-callbacks.html)
- [Metadata](https://docs.cocos.com/creator/3.8/manual/en/asset/meta.html)
- [Asset loading](https://docs.cocos.com/creator/3.8/manual/en/asset/dynamic-load-resources.html)
