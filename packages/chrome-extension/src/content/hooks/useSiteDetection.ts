// ─── Detects the current messaging site ──────────────────────────
import { useState, useEffect } from 'react';
import {
  getActiveSiteConfig,
  type SiteConfig,
} from '../services/siteConfigs';

/**
 * Returns the SiteConfig for the current page, or null if the site
 * is not supported.  Re-evaluates whenever the URL changes (SPA
 * navigation via popstate / hashchange).
 */
export function useSiteDetection(): SiteConfig | null {
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(
    getActiveSiteConfig,
  );

  useEffect(() => {
    const update = () => setSiteConfig(getActiveSiteConfig());

    window.addEventListener('popstate', update);
    window.addEventListener('hashchange', update);

    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener('hashchange', update);
    };
  }, []);

  return siteConfig;
}
