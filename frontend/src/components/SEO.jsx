import { useEffect } from "react";

const setMeta = (selector, attr, value) => {
  if (!value) return;
  let el = document.head.querySelector(selector);
  if (!el) {
    if (selector.startsWith('meta[')) {
      el = document.createElement('meta');
      const nameOrProp = selector.match(/\[(name|property)="([^"]+)"\]/);
      if (nameOrProp) {
        const [, key, val] = nameOrProp;
        el.setAttribute(key, val);
      }
      document.head.appendChild(el);
    } else if (selector.startsWith('link[')) {
      el = document.createElement('link');
      const relMatch = selector.match(/\[rel="([^"]+)"\]/);
      if (relMatch) el.setAttribute('rel', relMatch[1]);
      document.head.appendChild(el);
    }
  }
  if (el) el.setAttribute(attr, value);
};

export default function SEO({
  title,
  description,
  image,
  robots,
  canonical,
  twitterCard = 'summary_large_image',
  structuredData,
}) {
  useEffect(() => {
    const fullTitle = title?.trim();
    if (fullTitle) {
      document.title = fullTitle;
      setMeta('meta[property="og:title"]', 'content', fullTitle);
      setMeta('meta[name="twitter:title"]', 'content', fullTitle);
    }

    if (description) {
      setMeta('meta[name="description"]', 'content', description);
      setMeta('meta[property="og:description"]', 'content', description);
      setMeta('meta[name="twitter:description"]', 'content', description);
    }

    const url = canonical || (typeof window !== 'undefined' ? window.location.href : undefined);
    if (url) {
      setMeta('meta[property="og:url"]', 'content', url);
      setMeta('link[rel="canonical"]', 'href', url);
    }

    if (image) {
      setMeta('meta[property="og:image"]', 'content', image);
      setMeta('meta[name="twitter:image"]', 'content', image);
    }

    if (twitterCard) setMeta('meta[name="twitter:card"]', 'content', twitterCard);

    if (robots) setMeta('meta[name="robots"]', 'content', robots);

    setMeta('meta[property="og:type"]', 'content', 'website');

    // Inject/replace JSON-LD structured data
    const scriptId = 'seo-structured-data';
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();
    if (structuredData) {
      const sdEl = document.createElement('script');
      sdEl.type = 'application/ld+json';
      sdEl.id = scriptId;
      sdEl.text = JSON.stringify(structuredData);
      document.head.appendChild(sdEl);
    }
  }, [title, description, image, robots, canonical, twitterCard, structuredData]);

  return null;
}
