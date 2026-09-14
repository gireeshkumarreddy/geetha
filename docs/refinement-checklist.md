# Geetha Jewellery refinement audit

This is a correction pass on the existing implementation, not a redesign.

| Request | Implementation / limitation |
|---|---|
| 1. Overall design | Original ivory/champagne palette and section order retained; compact controls and restrained motion. |
| 2. Hero | Original intro CSS, JavaScript, assets and duration preserved. Existing full-resolution hero sources already selected. |
| 3. Our Story | Removed extra image overscan; original photographic content retained. Best supplied scene is 1015 × 513; true 4K replacement requires the original photography. |
| 4. Signature necklace | Existing lossless PNG selected; reveal reduced from 50% scale travel to 10%; 7px animation blur removed; light sweep softened. Source cutout is 618 × 703 and was originally enlarged from reference pixels, not native 4K. |
| 5. Gold rings | Shared scene lowered and reduced in depth, preserving the podium/piece coordinate system; lossless cutouts selected; active thumbnails reduced. Higher-resolution originals unavailable. |
| 6. Silver rings | Same scene sizing and lower placement; existing crossfade and material sheen retained, without image blur. |
| 7. Earrings | Lossless source cutouts; sway amplitude more than halved; drag limited to two degrees; hover lift reduced to 3px. Small original source panels limit photographic detail. |
| 8. Flower opening | All clipped petals pivot about the actual shared base centre; background scale drift removed; background, bud and jewellery no longer parallax in opposing directions. |
| 9. Silver bangles | Gold/silver pairs now share coordinates and fixed display boxes; matched reciprocal opacity windows; blur and transformation-time scaling removed. Original background differences remain inherent in supplied references. |
| 10. Men's collection | Refined six photography concepts in both metals; stronger brown text contrast; original showroom retained. Generated concepts are illustrative, not certified inventory or native 4K product photos. |
| 11. Men's cards | Compact thumbnails, near-square corners, restrained 2px hover lift; keyboard/category/metal browsing retained. |
| 12. Offer | Removed excessive image scale, small reveal travel, retained complete campaign composition and strong 50% hierarchy. Existing campaign source is below 4K; new original photography required for native 4K. |
| 13. CTAs | Collection, offer, appointment and directions buttons use restrained typography, flat colour, 2px corners and no bulky shadows; 44px minimum click targets retained. |
| 14. Motion | Limited necklace depth, earring movement, men’s emergence and promotional effects; original intro untouched; reduced-motion handling retained. |
| 15. Help-section logo | Unmodified original Logo.jpeg copied into public assets and used instead of recreated text; positioned over the old baked monogram. |
| 16. Store branding | Official logo replaces generic store symbol; supplied storefront photo retained unchanged. |
| 17. Store information | Ivory panel, smaller icons/labels, compact natural height, refined spacing and CTA. |
| 18. App | Description, six features, downloads, QR, smaller phone and benefits now form one composed section. Existing unconfigured app-store links remain coming-soon links. |
| 19. App type | Existing Cormorant Garamond / Jost system retained; smaller, proportional type. |
| 20. Backgrounds | Existing warm neutral environments retained; dark store-information panel replaced by ivory. Baked background softness cannot be removed without new imagery. |
| 21. Image audit | Project originals and both DOCX media sets inspected. Largest source references are 1672px wide; Phase-02 references mostly 1536 × 864. No artificial sharpening or upscaling added. Lossless PNG masters preferred where available. |
| 22. Visual review | Desktop/mobile screenshots and interaction checks; see validation notes below. |
| 23. Core design | Existing layouts, collection identities and intro preserved; only requested presentation refinements and app consolidation. |
| 24. Final standard | Responsive refinement implemented; native 4K imagery remains an explicit asset dependency, not claimed complete. |

## Asset provenance

- Official logo: unchanged `Logo.jpeg` (1426 × 1103), copied to `images/official-geetha-logo.jpeg`.
- Existing cutouts: original project PNGs, not regenerated products.
- New men's concept imagery: built-in image generation; native 1536 × 1024 atlas, each cell 512 × 512. Never label these 4K.
- Story, necklace, rings, earrings, bangles, offer, app and store cannot recover detail absent from the source files. Obtain original camera/render exports to complete the native-4K requirement without changing products.

## Validation

- Existing ten browser checks passed: navigation, metal/category changes, previous/next, keyboard selection, enquiry targets, mobile widths, reduced motion and asset loading.
- Full-page desktop and 390px mobile traversal produced no JavaScript errors, failed requests or horizontal page overflow.
- Additional checks verify shared bangle anchors, official branding, intact intro sources and app content containment.
