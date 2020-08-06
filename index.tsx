import React, { useCallback, useEffect, useState } from "react";
import { Catalog } from "@lingui/core";
import { I18nProvider } from "@lingui/react";

export type I18nLoaderProps = {
  locales: string[];
  localeDirectory: string;
};

/**
 * This component attempts to load the first available compiled message catalog for the array of passed in locales. If
 * none are available, the children are not rendered.
 *
 * This is based on the component created [here](https://lingui.js.org/guides/dynamic-loading-catalogs.html).
 */
export const I18nLoader: React.FC<I18nLoaderProps> = (props) => {
  const [locale, setLocale] = useState(null as string | null);
  const [catalog, setCatalog] = useState(null as Catalog | null);

  const loadCatalog = useCallback(async () => {
    for (let i = 0; i < props.locales.length; i++) {
      // Try to load the catalog for the current locale
      try {
        const currLocale = props.locales[i];
        const loadedCatalog = await import(
          /* webpackMode: "lazy", webpackChunkName: "i18n-[index]" */
          `@lingui/loader!${props.localeDirectory + currLocale}/messages.po`
        );

        // If we found a supported locale/catalog, update the state and bail
        if (loadedCatalog) {
          setCatalog(loadedCatalog);
          setLocale(currLocale);
          return;
        }
      } catch (_) {}
    }
  }, [props.locales, props.localeDirectory]);

  useEffect(() => {
    loadCatalog().then();
  }, [loadCatalog]);

  // Skip rendering when no supported locales are available.
  if (!locale || !catalog) return null;

  return (
    <I18nProvider language={locale} catalogs={{ [locale]: catalog }}>
      {props.children}
    </I18nProvider>
  );
};
