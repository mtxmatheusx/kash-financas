import { useEffect } from "react";
import { usePreferences } from "@/contexts/PreferencesContext";

interface SEOConfig {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown>;
}

const LANG_MAP: Record<string, string> = {
  "pt-BR": "pt-BR",
  en: "en",
  es: "es",
};

export function useSEO(config: SEOConfig) {
  const { language } = usePreferences();

  useEffect(() => {
    // html lang
    document.documentElement.lang = LANG_MAP[language] || "pt-BR";

    // title
    document.title = config.title;

    // helpers
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", config.description);
    setMeta("property", "og:title", config.title);
    setMeta("property", "og:description", config.description);
    setMeta("name", "twitter:title", config.title);
    setMeta("name", "twitter:description", config.description);

    if (config.ogImage) {
      setMeta("property", "og:image", config.ogImage);
      setMeta("name", "twitter:image", config.ogImage);
    }

    // canonical
    if (config.canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = config.canonical;
    }

    // JSON-LD
    if (config.jsonLd) {
      const existingScript = document.querySelector('script[data-seo-jsonld]');
      if (existingScript) existingScript.remove();
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo-jsonld", "true");
      script.textContent = JSON.stringify(config.jsonLd);
      document.head.appendChild(script);
      return () => { script.remove(); };
    }
  }, [config.title, config.description, config.canonical, config.ogImage, config.jsonLd, language]);
}
