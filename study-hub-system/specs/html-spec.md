# HTML Specification

**Applies to:** All study hub HTML files produced by this system.

---

## File Requirements

- Single self-contained HTML file (no external CSS, JS, or image dependencies)
- Valid HTML5 DOCTYPE
- UTF-8 charset
- All CSS inline in `<style>` block in `<head>`
- All JavaScript inline in `<script>` block before `</body>` (if used)
- No external fonts loaded over network (use system font stacks)
- No CDN dependencies (file must work offline)

---

## System Font Stacks

```css
/* Body text */
font-family: 'Georgia', 'Times New Roman', serif;

/* Headings */
font-family: 'Helvetica Neue', 'Arial', sans-serif;

/* Code / formulas */
font-family: 'Courier New', monospace;
```

---

## ID Naming Convention

All section IDs must be:
- Lowercase
- Hyphen-separated
- Unique within the file
- Descriptive of the section content

Examples:
```
id="module-overview"
id="topic-1-contract-formation"
id="topic-2-consideration"
id="case-hub"
id="quick-revision"
```

Never use:
- Numeric IDs only (`id="1"`)
- Duplicate IDs
- IDs with spaces or special characters

---

## Navigation Sidebar Structure

```html
<nav id="sidebar">
  <div class="sidebar-module-title">[MODULE_CODE] [Full Name]</div>
  <div class="sidebar-semester">[Semester] [Year]</div>

  <ul>
    <li><a href="#module-overview">Module Overview</a></li>
    <li class="sidebar-topic-group">
      <span>Topics</span>
      <ul>
        <li><a href="#topic-1-[name]">1. [Topic Name]</a></li>
        <li><a href="#topic-2-[name]">2. [Topic Name]</a></li>
      </ul>
    </li>
    <li><a href="#case-hub">Case Hub</a></li>  <!-- law only -->
    <li><a href="#quick-revision">Quick Revision</a></li>
  </ul>
</nav>
```

---

## Page Layout

```css
body {
  display: flex;
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

#sidebar {
  width: 240px;
  min-width: 240px;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

#main-content {
  flex: 1;
  padding: 2rem 3rem;
  max-width: 900px;
}
```

---

## Topic Section Structure

```html
<section id="topic-1-[name]" class="topic-section">
  <div class="topic-header">
    <span class="topic-number">Topic 1</span>
    <h2>[Topic Name]</h2>
  </div>

  <div class="topic-body">
    <!-- Content blocks -->
  </div>
</section>
```

---

## Content Block Types

### Principle Block (Law)
```html
<div class="block principle-block">
  <h3 class="block-title">Legal Principle</h3>
  <p>[Principle statement]</p>
</div>
```

### Legal Test Block (Law)
```html
<div class="block legal-test-block">
  <h3 class="block-title">Legal Test</h3>
  <ol>
    <li>Element 1</li>
    <li>Element 2</li>
  </ol>
</div>
```

### Formula Block (Quantitative)
```html
<div class="block formula-block">
  <h3 class="block-title">Formula: [Name]</h3>
  <div class="formula-display">[Formula]</div>
  <div class="formula-variables">
    <p><strong>Where:</strong></p>
    <ul>
      <li>[Variable] = [Definition]</li>
    </ul>
  </div>
</div>
```

### Case Summary Block (Law)
```html
<div class="block case-block" id="case-[name-slug]">
  <h4 class="case-name">[Case Name] [[Year]]</h4>
  <p class="case-citation">[Citation]</p>
  <div class="case-body">
    <p><strong>Facts:</strong> [Facts]</p>
    <p><strong>Issue:</strong> [Issue]</p>
    <p><strong>Ratio:</strong> [Ratio]</p>
    <p><strong>Exam use:</strong> [How to cite]</p>
  </div>
</div>
```

### Exam Trap Block (All)
```html
<div class="block exam-trap-block">
  <h3 class="block-title">⚠ Exam Traps</h3>
  <ul>
    <li>[Trap description]</li>
  </ul>
</div>
```

---

## Version Watermark

Must appear in the HTML footer on every page (screen and print):

```html
<footer id="page-footer">
  <p class="version-watermark">
    [MODULE_CODE] Study Hub &nbsp;|&nbsp;
    [Semester] [Year] &nbsp;|&nbsp;
    Version [X.X] &nbsp;|&nbsp;
    [DRAFT / APPROVED PRINT CANDIDATE] &nbsp;|&nbsp;
    Generated [Date]
  </p>
</footer>
```

---

## Disallowed Patterns

- External CDN links (`<link href="https://...")`)
- Inline `style=""` attributes (use classes instead)
- `<script src="...">` external scripts
- `<img src="...">` with external URLs
- `onclick="..."` event handlers (use event listeners in script block instead)
- Duplicate IDs
- IDs that are purely numeric
