# ECO114 A3 Final Master Hub — Progress Sidebar Audit
Date: 2026-06-14

## localStorage key
eco114_a3_final_master_progress_v1
(Does not collide with older ECO114 keys: eco114-a3-control-centre-v1, etc.)

## Progress checkboxes
Total: 75 "Done + understood" checkboxes
All progress IDs unique: verified

## Progress categories (20 sections)
dashboard, heatmap, study-route, warroom, formulas, tf, mcq,
unit8, unit7, unit10, unit6, unit3, unit4, unit5, unit2, unit1,
section-c, final-boss, final-recall, mistakes

## Sidebar features implemented
- [x] Fixed left sidebar (position:fixed)
- [x] Brand/title with version
- [x] Overall progress percentage
- [x] Overall progress bar (gradient yellow→green)
- [x] "Auto progress" tracker box with count (N/75 understood)
- [x] Per-section mini progress bars in sidebar
- [x] Per-section percentage labels
- [x] Nav links with per-section progress percentages
- [x] Active nav link highlighting (hash-based)
- [x] "Done + understood" checkboxes throughout page
- [x] Reset study progress button (with confirm dialog)
- [x] Progress stored in localStorage (survives reload)
- [x] Progress updates instantly when checkboxes ticked
- [x] Sidebar progress updates automatically on change
- [x] Nav section percentages update automatically

## Reset behaviour
Confirm dialog required. Clears all cb:* keys from localStorage.

## Print behaviour
Sidebar, topbar and .no-print elements hidden via @media print.
All details elements forced open in print. Answers revealed (filter:none).

## Mobile behaviour
@media (max-width:900px): sidebar becomes relative/static block. Main has no left padding. Grid collapses to single column.

## Known limitations
- Active nav link requires hash in URL. Intersection Observer not implemented (future improvement).
- Sidebar overflow uses scrollbar (no mobile hamburger menu).

## Post-audit patch update — 2026-06-14 (v1.4)

### Changes to progress tracking
- Total checkboxes: 75 → 84 (9 new practice bank checkboxes, 1 per unit).
- Closed-book language on 8 key checkboxes (graphs redrawn from memory, practice completed closed-book).
- Sidebar note updated: "Only tick after closed-book recall or completed written practice."
- Dashboard honesty warning added (hot-pink card).
- Practice bank section added to SECTIONS map and NAV array.
- localStorage: now wrapped in safeGet/safeSet with MEM fallback.
- Nav active highlight: updateProgress() called immediately on click (no delay).
- Active recall: delegated listener, no handler leakage, clearing revealed states on recall-on.
