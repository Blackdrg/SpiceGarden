# Bundle Performance SEO i18n — SpiceGarden

## Bundle Performance

### Targets
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Total Blocking Time (TBT): < 200ms
- Cumulative Layout Shift (CLS): < 0.1
- JavaScript bundle size: < 250KB gzipped per page

### Optimization Measures Implemented
- Next.js Image optimization with `next/image`
- Font optimization with `next/font`
- Code splitting via dynamic imports
- Tree-shaking enabled in production builds
- Gzip/Brotli compression on CDN edge
- Static asset caching with immutable cache headers
- Prefetching of visible links (`next/link` prefetch)

### Monitoring
- Core Web Vitals tracked via Google Analytics / CrUX
- Lighthouse CI in the pipeline
- Bundle analysis via `next build --analyze`

## SEO

### Implemented
- [x] Semantic HTML5 structure
- [x] Meta description and Open Graph tags
- [x] Canonical URLs
- [x] robots.txt and sitemap.xml generation
- [x] Structured data (JSON-LD) for restaurant listings
- [x] SSR/SSG for all public pages
- [x] Proper heading hierarchy (h1 → h2 → h3)
- [x] Alt text on all images
- [x] Internal linking strategy

### Recommended
- [ ] Page speed audit via PageSpeed Insights (monthly)
- [ ] Core Web Vitals monitoring dashboard
- [ ] hreflang tags for multi-language support

## Internationalization (i18n)

### Current State
- [ ] No i18n framework implemented
- [ ] All UI strings are hardcoded in English
- [ ] No locale detection or switching

### Recommended Implementation
1. Install `next-intl` or `react-intl`
2. Create locale files under `apps/customer-web/src/locales/`
3. Implement locale detection from `Accept-Language` header
4. Add language switcher UI component
5. Add i18n middleware for locale routing

### Supported Locales (Planned)
- en (English) — primary
- hi (Hindi)
- bn (Bengali)
- ta (Tamil)
- te (Telugu)
- mr (Marathi)
- gu (Gujarati)

### Effort Estimate
- i18n framework setup: 2-3 days
- Translation of core UI strings: 1-2 weeks (requires translators)
- RTL support (if needed): 3-5 days