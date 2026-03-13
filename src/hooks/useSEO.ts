import { useEffect } from "react";
import { usePreferences } from "@/contexts/PreferencesContext";

interface SEOConfig {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const LANG_MAP: Record<string, string> = {
  "pt-BR": "pt-BR",
  en: "en",
  es: "es",
};

export function useSEO(config: SEOConfig) {
  const { language } = usePreferences();

  useEffect(() => {
    document.documentElement.lang = LANG_MAP[language] || "pt-BR";
    document.title = config.title;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // Basic meta
    setMeta("name", "description", config.description);

    // Open Graph — complete
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", "Faciliten");
    setMeta("property", "og:title", config.title);
    setMeta("property", "og:description", config.description);
    if (config.canonical) setMeta("property", "og:url", config.canonical);
    if (config.ogImage) {
      setMeta("property", "og:image", config.ogImage);
      setMeta("property", "og:image:width", "1200");
      setMeta("property", "og:image:height", "630");
      setMeta("property", "og:image:type", "image/png");
      setMeta("property", "og:image:alt", config.title);
    }
    setMeta("property", "og:locale", language === "en" ? "en_US" : language === "es" ? "es_ES" : "pt_BR");

    // Twitter Cards — complete
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:site", "@Faciliten");
    setMeta("name", "twitter:creator", "@Faciliten");
    setMeta("name", "twitter:title", config.title);
    setMeta("name", "twitter:description", config.description);
    if (config.ogImage) {
      setMeta("name", "twitter:image", config.ogImage);
      setMeta("name", "twitter:image:alt", config.title);
    }

    // Canonical
    if (config.canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = config.canonical;
    }

    // JSON-LD (supports single or array)
    if (config.jsonLd) {
      const existingScript = document.querySelector('script[data-seo-jsonld]');
      if (existingScript) existingScript.remove();
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo-jsonld", "true");
      script.textContent = JSON.stringify(
        Array.isArray(config.jsonLd) ? config.jsonLd : config.jsonLd
      );
      document.head.appendChild(script);
      return () => { script.remove(); };
    }
  }, [config.title, config.description, config.canonical, config.ogImage, config.jsonLd, language]);
}
