import PropTypes from "prop-types";
import { useCallback, useEffect, useRef, useState } from "react";
import LoadingOverlay from "../components/common/LoadingOverlay";
import { PageLoadingContext } from "./pageLoading";

// Requests often chain — one settles and its effect fires the next a frame later. Without a grace
// period the overlay would drop and come back in between, flashing half-loaded content.
const SETTLE_MS = 200;

export const PageLoadingProvider = ({ loading = false, children }) => {
  const pendingRef = useRef(new Set());
  const [pendingCount, setPendingCount] = useState(0);

  const report = useCallback((id, isLoading) => {
    const pending = pendingRef.current;
    if (isLoading) pending.add(id);
    else pending.delete(id);
    setPendingCount(pending.size);
  }, []);

  const busy = loading || pendingCount > 0;
  const [lingering, setLingering] = useState(busy);
  useEffect(() => {
    if (busy) {
      setLingering(true);
      return undefined;
    }
    const timer = setTimeout(() => setLingering(false), SETTLE_MS);
    return () => clearTimeout(timer);
  }, [busy]);

  return (
    <PageLoadingContext.Provider value={report}>
      {children}
      <LoadingOverlay open={busy || lingering} />
    </PageLoadingContext.Provider>
  );
};

PageLoadingProvider.propTypes = {
  loading: PropTypes.bool,
  children: PropTypes.node,
};
