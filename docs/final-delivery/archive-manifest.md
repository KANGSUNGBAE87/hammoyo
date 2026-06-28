# Final Delivery Archive Manifest

Source package: `HAMMOYEO_FINAL_DELIVERY/`

Status: curated subset promoted on 2026-06-27.

## Promoted As Canonical Text

| Source | Tracked destination | Use |
| --- | --- | --- |
| `docs/00_HAMMOYEO_FINAL_HANDOFF_ALL.md` | `docs/final-delivery/handoff-all.md` | Combined handoff reference |
| `docs/01_FINAL_PRODUCT_PLAN.md` | `docs/final-delivery/product-plan.md` | Product source of truth |
| `docs/02_FINAL_IMPLEMENTATION_PLAN.md` | `docs/final-delivery/implementation-plan.md` | Implementation source of truth |
| `docs/03_FINAL_DESIGN_PLAN.md` | `docs/final-delivery/design-plan.md` | Design source of truth |
| `docs/04_FINAL_IMAGE_ASSET_PLAN.md` | `docs/final-delivery/image-asset-plan.md` | Image and asset usage policy |
| `tokens/hammoyo_design_tokens_final_v12.json` | `docs/final-delivery/tokens.json` | Final token source |

## Promoted As Visual Reference

| Source folder | Tracked destination | Use |
| --- | --- | --- |
| `images/contact_sheets/` | `docs/final-delivery/reference/contact-sheets/` | Whole-package visual overview |
| `images/split_assets/screens/` | `docs/final-delivery/reference/screens/` | Screen implementation target |
| `images/split_assets/components/` | `docs/final-delivery/reference/components/` | Component implementation target |

## Promoted As Runtime Assets

| Source folder | Tracked destination | Use |
| --- | --- | --- |
| `images/split_assets/hero/` selected files | `docs/assets/final/hero/`, `docs/release/assets/final/hero/` | Home hero and wordmark |
| `images/split_assets/states/*_object.png` | `docs/assets/final/states/`, `docs/release/assets/final/states/` | Empty/result state illustrations |
| `images/split_assets/icons/*_object.png` | `docs/assets/final/icons/`, `docs/release/assets/final/icons/` | Small functional icon objects |
| `images/split_assets/backgrounds/` selected files | `docs/assets/final/backgrounds/`, `docs/release/assets/final/backgrounds/` | Home and result decoration |
| `images/split_assets/characters/*_character_only_crop.png` | `docs/assets/final/characters/`, `docs/release/assets/final/characters/` | Anonymous avatars and mascot use |
| `images/split_assets/communication/` selected files | `docs/assets/final/communication/`, `docs/release/assets/final/communication/` | Share, reminder, privacy, and message states |

## Kept Only In Local Archive

| Source | Reason |
| --- | --- |
| `_render/` | PDF/page render preview for human review, not app source |
| `docs_docx/` | Word delivery copy; Markdown docs are canonical for implementation |
| `images/original_boards/` | Original visual boards with large source/reference images |
| Full `images/split_assets/*_card.png` variants not copied to runtime | Useful as reference, but runtime should use objects or CSS-rendered UI |

The archive is intentionally ignored by `.gitignore` and `.graphifyignore`.
