# Visual Style Guide

**Purpose:** Ensure every study hub, cover sheet, and case sheet looks like it belongs to the same professional system, regardless of module.

---

## Design Principles

1. **Professional over decorative.** The hub should feel like a published reference, not a school project.
2. **Colour serves navigation, not aesthetics.** Every colour must help the reader find something faster.
3. **White space is structure.** Dense text is harder to revise from. Use space deliberately.
4. **Print and screen are equal.** A design that only works on screen has failed.
5. **Consistency enables speed.** When every module looks the same, the reader navigates by feel.

---

## Module Colour Themes

### Law (FOL, CON, etc.)
```css
--primary:    #1a2744;   /* deep navy */
--accent:     #c9a227;   /* gold */
--bg:         #faf8f3;   /* warm cream */
--surface:    #ffffff;
--text:       #1a1a1a;
--text-muted: #5a5a5a;
--border:     #d4c9a8;
```

### Accounting (FAC, etc.)
```css
--primary:    #1a3d2b;   /* forest green */
--accent:     #d4a017;   /* amber */
--bg:         #f9f9f7;
--surface:    #ffffff;
--text:       #1a1a1a;
--text-muted: #5a5a5a;
--border:     #c5d4c0;
```

### Statistics / Data Science (SDS, etc.)
```css
--primary:    #1a3a44;   /* deep teal */
--accent:     #e05c3a;   /* coral */
--bg:         #f7f8f9;
--surface:    #ffffff;
--text:       #1a1a1a;
--text-muted: #5a5a5a;
--border:     #c0d0d4;
```

### Economics (ECO, etc.)
```css
--primary:    #3d1a1a;   /* burgundy */
--accent:     #4a7fa5;   /* steel blue */
--bg:         #fafaf8;
--surface:    #ffffff;
--text:       #1a1a1a;
--text-muted: #5a5a5a;
--border:     #d4c0c0;
```

---

## Typography Scale

```css
/* Page title */
h1 { font-size: 2rem; font-weight: 700; color: var(--primary); }

/* Topic title */
h2 { font-size: 1.5rem; font-weight: 700; color: var(--primary); border-bottom: 2px solid var(--accent); }

/* Section heading */
h3 { font-size: 1.15rem; font-weight: 600; color: var(--primary); }

/* Sub-heading */
h4 { font-size: 1rem; font-weight: 600; color: var(--text); }

/* Body */
p, li { font-size: 0.95rem; line-height: 1.6; color: var(--text); }

/* Muted / secondary */
.muted { font-size: 0.875rem; color: var(--text-muted); }
```

Print sizes (in @media print): reduce all by approximately 15% (see print-spec.md).

---

## Content Block Colour Coding

Each block type has a consistent left-border colour so the reader can scan without reading:

| Block Type | Left Border Colour | Background |
|-----------|-------------------|------------|
| Principle / Key Rule | var(--primary) | var(--primary) at 5% opacity |
| Legal Test (Law) | var(--accent) | var(--accent) at 8% opacity |
| Formula (Quant) | var(--primary) | var(--primary) at 5% opacity |
| Case Summary (Law) | var(--accent) | var(--accent) at 5% opacity |
| Exam Trap | #c0392b (red) | #fdf2f2 |
| Quick Revision | var(--primary) | var(--bg) |
| Worked Example (Quant) | #27ae60 (green) | #f4faf6 |
| Definition | var(--text-muted) | var(--bg) |

```css
.block {
  border-left: 4px solid var(--primary);
  background: rgba(26, 39, 68, 0.04);
  padding: 1rem 1.25rem;
  margin: 1rem 0;
  border-radius: 0 4px 4px 0;
}

.exam-trap-block {
  border-left-color: #c0392b;
  background: #fdf2f2;
}

.worked-example-block {
  border-left-color: #27ae60;
  background: #f4faf6;
}
```

---

## Sidebar Style

```css
#sidebar {
  background: var(--primary);
  color: #ffffff;
  padding: 1.5rem 1rem;
}

#sidebar a {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 0.875rem;
  display: block;
  padding: 0.35rem 0.5rem;
  border-radius: 4px;
}

#sidebar a:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.sidebar-module-title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent);
  margin-bottom: 0.25rem;
}
```

---

## Topic Header Band

Each topic section begins with a full-width header band in the module primary colour:

```css
.topic-header {
  background: var(--primary);
  color: #ffffff;
  padding: 1.5rem 2rem;
  margin: 0 -3rem 2rem -3rem;   /* bleed to edge of content area */
}

.topic-number {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent);
  display: block;
  margin-bottom: 0.25rem;
}

.topic-header h2 {
  color: #ffffff;
  border: none;
  margin: 0;
  font-size: 1.75rem;
}
```

---

## Tables

```css
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  margin: 1rem 0;
}

th {
  background: var(--primary);
  color: #ffffff;
  padding: 0.6rem 0.8rem;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 600;
}

td {
  padding: 0.5rem 0.8rem;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}

tr:nth-child(even) td {
  background: rgba(0, 0, 0, 0.02);
}
```

---

## Cover Sheet Style (Module 08)

Cover sheets use the same colour theme but a more visual treatment:
- Full primary colour band (top 40% of page)
- Topic number in accent colour, very large (5–6rem)
- Topic title in white, 2rem
- Lower 60%: cream/white background, key ideas in body text
- Thin accent rule separating the two halves

---

## What NOT to Do

- Do not use more than two colours per block
- Do not use yellow highlighter effects (unreadable in print)
- Do not use shadow effects on text
- Do not use more than 3 heading levels within a single section
- Do not use colour as the only differentiator (use text labels too)
- Do not use decorative fonts — system serif and sans-serif only
- Do not use background images (performance, print, accessibility)
