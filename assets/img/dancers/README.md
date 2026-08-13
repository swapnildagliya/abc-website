# ABC dancer cutouts

This folder contains the 13 dancers currently listed in the About-page roster.

- `originals/` contains the highest-resolution source images retrieved from the existing Squarespace CDN entries.
- `cutouts/` contains transparent RGBA PNG extractions, one file per dancer.
- `cutouts-first-pass/` preserves the five pre-retouch PNGs so the manual work is reversible.
- `cutouts-preview.jpg` is a dark-background review sheet; it is not transparent and is intended only for quick visual review.

The extraction is non-generative: it preserves the source photo and does not invent missing body parts. Consequently, framing varies between portraits and full-body images. A few action photographs contain overlapping performers that cannot be cleanly separated from the named dancer without a better source photograph or manual retouching.

Kaushika, Khushboo, Narcisse, Srimahavalli, and Svetlana received a conservative manual alpha-mask pass. Narcisse and Khushboo improved substantially. Kaushika still has a small directly overlapping background area near the hair. Srimahavalli and Svetlana remain group-action sources: other bodies overlap the named dancer and shared costume silhouette, so a clean individual cutout requires a different source photo.
