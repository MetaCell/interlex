// Kept apart from the provider component so that file only exports components (fast refresh).
import { createContext, useContext, useEffect, useId } from "react";

export const PageLoadingContext = createContext(null);

/**
 * Holds the page's loading overlay up while `loading` is true. Sections report here instead of
 * drawing their own spinner, so a page settles once rather than piece by piece. A no-op outside a
 * PageLoadingProvider.
 */
export const useReportLoading = (loading) => {
  const report = useContext(PageLoadingContext);
  const id = useId();
  useEffect(() => {
    if (!report || !loading) return undefined;
    report(id, true);
    return () => report(id, false);
  }, [report, id, loading]);
};
