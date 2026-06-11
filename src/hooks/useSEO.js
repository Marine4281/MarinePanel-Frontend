// src/hooks/useSEO.js  (NEW FILE)

import { useEffect } from "react";
import API from "../api/axios";

let seoCache = null; // in-memory cache — one fetch per page load

const setMeta = (name, content, attr = "name") => {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const setLink = (rel, href, id) => {
  if (!href) return;
  let el = id
    ? document.getElementById(id)
    : document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    if (id) el.id = id;
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const setCanonical = (href) => {
  if (!href) return;
  let el = document.querySelector("link[rel='canonical']");
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const injectSchemaOrg = (data) => {
  // Remove existing injected schema
  document.querySelectorAll("script[data-seo='true']").forEach((s) => s.remove());

  const orgSchema = {
    "@context": "https://schema.org",
    "@type":    "Organization",
    "name":     data.brandName,
    "url":      data.seo.canonical || window.location.origin,
    "logo":     data.logo || data.seo.ogImage || "",
    "description": data.seo.description,
  };

  // Add sameAs for main panel only
  const social = data.seo.schemaOrg;
  if (social) {
    const sameAs = [social.whatsapp, social.telegram, social.instagram].filter(Boolean);
    if (sameAs.length) orgSchema.sameAs = sameAs;
  }

  const serviceSchema = {
    "@context":    "https://schema.org",
    "@type":       "Service",
    "serviceType": "Social Media Marketing Panel",
    "provider":    { "@type": "Organization", "name": data.brandName },
    "areaServed":  "Worldwide",
    "description": data.seo.description,
  };

  [orgSchema, serviceSchema].forEach((schema) => {
    const script = document.createElement("script");
    script.type              = "application/ld+json";
    script.dataset.seo       = "true";
    script.textContent       = JSON.stringify(schema);
    document.head.appendChild(script);
  });
};

export const useSEO = () => {
  useEffect(() => {
    const apply = async () => {
      try {
        if (!seoCache) {
          const res = await API.get("/seo/public");
          seoCache  = res.data;
        }

        const data = seoCache;
        const seo  = data.seo || {};

        // ── <title> ──────────────────────────────────────────────
        document.title = seo.title || data.brandName || "SMM Panel";

        // ── Favicon ──────────────────────────────────────────────
        setLink("icon", seo.favicon || data.logo, "dynamic-favicon");
        setLink("apple-touch-icon", seo.favicon || data.logo);

        // ── Standard meta ────────────────────────────────────────
        setMeta("description",        seo.description);
        setMeta("keywords",           seo.keywords);
        setMeta("robots",             "index, follow");
        setMeta("author",             data.brandName);

        // ── Open Graph ───────────────────────────────────────────
        setMeta("og:type",            "website",           "property");
        setMeta("og:title",           seo.title,           "property");
        setMeta("og:description",     seo.description,     "property");
        setMeta("og:url",             seo.canonical || window.location.href, "property");
        setMeta("og:image",           seo.ogImage || data.logo, "property");
        setMeta("og:site_name",       data.brandName,      "property");

        // ── Twitter Card ─────────────────────────────────────────
        setMeta("twitter:card",        seo.twitterCard || "summary_large_image");
        setMeta("twitter:title",       seo.title);
        setMeta("twitter:description", seo.description);
        setMeta("twitter:image",       seo.ogImage || data.logo);

        // ── Canonical ────────────────────────────────────────────
        if (seo.canonical) setCanonical(seo.canonical);

        // ── Theme color ──────────────────────────────────────────
        setMeta("theme-color", data.themeColor);
        document.documentElement.style.setProperty("--theme-color", data.themeColor);

        // ── Schema.org structured data ───────────────────────────
        injectSchemaOrg(data);

      } catch (err) {
        console.warn("useSEO: failed to load SEO data", err);
      }
    };

    apply();
  }, []);
};

// Reset cache (call this after branding update so next load re-fetches)
export const resetSeoCache = () => { seoCache = null; };
