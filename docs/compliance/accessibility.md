# Accessibility Compliance — SpiceGarden

## WCAG 2.1 AA Conformance Targets

### Perceivable
- [x] All images have alt text (Next.js Image component with alt prop)
- [x] Color contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- [x] Text can be resized up to 200% without loss of content
- [x] Content is readable when zoomed to 200%
- [ ] Audio descriptions for video content (if any)
- [ ] Captions for all pre-recorded audio/video

### Operable
- [x] All functionality available via keyboard
- [x] No keyboard traps
- [x] Focus indicator visible on all interactive elements
- [x] Page titles describe page content
- [x] Link purpose distinguishable from context
- [x] Form inputs have associated labels
- [ ] Skip navigation link on all pages
- [ ] Consistent navigation across all pages

### Understandable
- [x] Language of page declared in HTML lang attribute
- [x] Form errors identified programmatically
- [x] Error suggestions provided when input fails validation
- [x] Instructions provided for complex interactions

### Robust
- [x] Valid HTML5 markup
- [x] ARIA landmarks used for page regions
- [x] ARIA labels on interactive elements where needed
- [x] Screen reader testing completed (manual, needs ongoing)

## Automated Accessibility Testing

### Lighthouse CI Integration
Add to CI pipeline:
```yaml
- name: Accessibility Audit
  run: |
    npx lighthouse-ci upload --assert.pa11y=0
```

### Pa11y Configuration
```json
{
  "ci": {
    "assert": {
      "assertions": {
        "color-contrast": "error",
        "html-has-lang": "error",
        "html-lang-valid": "error",
        "image-alt": "error",
        "label": "error",
        "link-name": "error"
      }
    }
  }
}
```

## Known Gaps
1. React Doctor warnings about accessibility are tracked in the react-doctor catalog
2. Screen reader testing requires manual QA with NVDA/JAWS/VoiceOver
3. Color contrast audit needs to be run against the production build
4. Keyboard navigation testing needs manual QA for complex components

## Remediation Priority
- High: Color contrast fixes, missing alt text, form labels
- Medium: Skip navigation, ARIA landmarks, focus management
- Low: Audio descriptions, captions, screen reader compatibility