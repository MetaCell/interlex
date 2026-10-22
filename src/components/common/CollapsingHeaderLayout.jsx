import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/material";

const LINE_HEIGHT_PX = 16;

const wheelPixels = (event, scroller) => {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * LINE_HEIGHT_PX;
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * scroller.clientHeight;
  return event.deltaY;
};

// The page scrolls until the header is out of view, and only then do the panels below scroll on
// their own. Native scroll chaining runs the other way round — the innermost scroller under the
// pointer moves first — so a downward wheel goes to the page while there is header left to hide.
// Upward wheels stay native: the panels return to their top first and the header comes back last.
const routeWheelToHeader = (scroller) => (event) => {
  if (event.defaultPrevented || event.ctrlKey || event.shiftKey || event.deltaY <= 0) return;
  const remaining = scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop;
  if (remaining < 1) return;
  event.preventDefault();
  scroller.scrollTop += Math.min(wheelPixels(event, scroller), remaining);
};

/**
 * Below xl, a header in the page's own scroll, above a body exactly one viewport tall, so the page
 * scrolls by the header's height and the body's panels keep their own scrollbars. From xl the
 * screen is tall enough for both, so the header stays put and the body takes the rest. Either way
 * the body is a flex column: a child takes the full height with `flex: 1, minHeight: 0`.
 */
const CollapsingHeaderLayout = ({ header, children }) => {
  const scrollerRef = useRef(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const onWheel = routeWheelToHeader(scroller);
    // Non-passive, unlike React's onWheel, which would ignore preventDefault.
    scroller.addEventListener("wheel", onWheel, { passive: false });
    return () => scroller.removeEventListener("wheel", onWheel);
  }, []);

  return (
    // Block layout below xl, not a flex column: as a flex item the body would shrink back to fit,
    // and the page would have nothing to scroll.
    <Box
      ref={scrollerRef}
      sx={{
        width: 1,
        height: 1,
        overflowX: "hidden",
        overflowY: { xs: "auto", xl: "hidden" },
        display: { xs: "block", xl: "flex" },
        flexDirection: "column",
      }}
    >
      {header}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: { xs: 1, xl: "auto" },
          flex: { xl: 1 },
          minHeight: { xl: 0 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

CollapsingHeaderLayout.propTypes = {
  header: PropTypes.node.isRequired,
  children: PropTypes.node,
};

export default CollapsingHeaderLayout;
