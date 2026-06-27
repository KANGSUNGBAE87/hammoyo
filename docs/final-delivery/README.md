# Hammoyo Final Delivery Source

This directory contains the curated implementation subset promoted from the local
`HAMMOYEO_FINAL_DELIVERY/` package.

The original delivery package remains a local archive and is intentionally
ignored by git. This directory is the tracked source that future implementation
agents should read first.

## Canonical Docs

- `product-plan.md`: final product definition and positioning.
- `implementation-plan.md`: final implementation contract and P0/P1/P2 order.
- `design-plan.md`: final visual system and screen direction.
- `image-asset-plan.md`: final asset usage policy.
- `tokens.json`: final v12 color, radius, typography, layout, and motion tokens.
- `handoff-all.md`: combined handoff reference for human review.

## Reference Assets

Files under `reference/` are implementation reference, not runtime assets.

- `reference/contact-sheets/`: overview sheets for screen samples and split assets.
- `reference/screens/`: screen sample images to match layout, hierarchy, and tone.
- `reference/components/`: component preview images to translate into HTML/CSS.

Do not insert component preview PNGs as app UI controls. Use them as visual
targets when implementing cards, chips, badges, progress, segmented controls,
and share boxes in code.

## Runtime Assets

Runtime-ready assets promoted from the final package live in:

- `../assets/final/`
- `../mvp/assets/final/`

These include selected hero, state, icon, background, character, and
communication assets that can be referenced by the static app or future app
shell.

## Excluded From Tracking

The following original package folders remain local reference/archive only:

- `_render/`
- `docs_docx/`
- `images/original_boards/`

They are useful for human handoff review, but not required as tracked
implementation source.
