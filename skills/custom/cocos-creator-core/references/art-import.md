# Creator artwork handoff

Use create-game-assets for art direction, coherent families, normalization,
manifest and provenance. Actual raster generation requires an available generation
tool; a concept image is not a rigged 3D mesh.

1. Record native resolution, view, frame size, alpha, palette, anchors and intended
   on-screen scale. Keep UI text in Label components.
2. Import under assets/; preserve existing .meta files. Let the matching editor
   generate metadata for new assets instead of inventing UUIDs.
3. Choose sprite-frame as image type in Inspector and apply. Assign the resulting
   SpriteFrame sub-asset to Sprite.spriteFrame. ImageAsset, Texture2D and SpriteFrame
   are distinct types.
4. Choose nearest filtering for pixel art; evaluate mipmaps, wrapping, compression
   and alpha edges for the actual target. Set UITransform size and Sprite size mode
   deliberately; inspect anchor, trimming and frame alignment. For sliced UI, set
   borders and sliced mode so corners retain their shape.
5. Sprite sheets require real frame/atlas data and animation timing. A generated
   grid alone is not an animation clip. Inspect bounds, padding and packing bleed.
6. Prefer Inspector references. For assets/resources/art/player.png, dynamic
   SpriteFrame loading uses art/player/spriteFrame with type SpriteFrame (no file
   extension). Other directories require a bundle/reference strategy.
7. For models use the project's supported DCC/import pipeline and validate scale,
   axes, UVs, materials, skeleton and animation in Creator.
8. Inspect a contact sheet and actual scene at native resolution: silhouettes,
   UI aspect ratios, animation jitter, tile seams, camera visibility and alpha.
   Build the target to check texture compression, memory and batching; retain
   source/license records and report unverified checks.

[Official SpriteFrame workflow](https://docs.cocos.com/creator/3.8/manual/en/asset/sprite-frame.html)
