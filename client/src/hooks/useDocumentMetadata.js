import { useEffect } from "react";

export function useDocumentMetadata({ title, description, schema, noindex = false }) {
  useEffect(() => {
    // 1. Update Document Title
    const suffix = "GaramBazaar";
    if (title) {
      document.title = `${title} | ${suffix}`;
    } else {
      document.title = `${suffix} | India's Finest Everyday Essentials`;
    }

    // 2. Update Meta Description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", description);
    }

    // 3. Update Robots Directives (noindex)
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (noindex) {
      if (!metaRobots) {
        metaRobots = document.createElement("meta");
        metaRobots.setAttribute("name", "robots");
        document.head.appendChild(metaRobots);
      }
      metaRobots.setAttribute("content", "noindex, nofollow");
    } else if (metaRobots) {
      metaRobots.removeAttribute("content");
      metaRobots.setAttribute("content", "index, follow");
    }

    // 4. Inject Structured JSON-LD Schema
    const schemaId = "ld-schema-json";
    let schemaScript = document.getElementById(schemaId);

    if (schema) {
      if (!schemaScript) {
        schemaScript = document.createElement("script");
        schemaScript.setAttribute("type", "application/ld+json");
        schemaScript.setAttribute("id", schemaId);
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schema);
    } else if (schemaScript) {
      schemaScript.remove();
    }

    // 5. Update Canonical Link
    const canonicalId = "canonical-link";
    let canonicalLink = document.getElementById(canonicalId);
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      canonicalLink.setAttribute("id", canonicalId);
      document.head.appendChild(canonicalLink);
    }
    const currentCanonicalUrl = window.location.origin + window.location.pathname;
    canonicalLink.setAttribute("href", currentCanonicalUrl);

    // Cleanup script and canonical tag on unmount
    return () => {
      const activeScript = document.getElementById(schemaId);
      if (activeScript) {
        activeScript.remove();
      }
      const activeCanonical = document.getElementById(canonicalId);
      if (activeCanonical) {
        activeCanonical.remove();
      }
    };
  }, [title, description, schema, noindex]);
}
