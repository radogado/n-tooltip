# n-tooltip
natUIve Tooltip

## Usage

- **Include files**:
  - `n-tooltip.css`
  - `n-tooltip.js`

- **Markup**:

```html
<span class="n-tooltip" aria-describedby="tooltip1">
  Hover / focus me
  <span class="n-tooltip__icon"></span>
</span>
<span class="n-tooltip__content" id="tooltip1" role="tooltip">
  Tooltip content
</span>
```

## Notes

- **Positioning**: tooltip content is temporarily moved to `document.body` when shown to avoid clipping.
- **A11y**: the trigger gets `tabindex="0"` (if missing) and toggles `aria-expanded`.
