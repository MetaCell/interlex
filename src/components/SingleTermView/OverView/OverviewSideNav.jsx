import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import { vars } from "../../../theme/variables";

const { gray300, gray600, gray800, brand600 } = vars;

// Fixed icon-rail nav for the Overview tab's sections. Tracks which section is
// in view via IntersectionObserver and scrolls to a section on click - the top
// entry (Details) doubles as the "back to top" affordance for the long page.
const OverviewSideNav = ({ items }) => {
  const [activeId, setActiveId] = useState(items[0]?.id);

  useEffect(() => {
    const elements = items
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);
    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  const handleClick = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: "50%",
        right: "1.5rem",
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        zIndex: 10,
      }}
    >
      {items.map(({ id, label }) => (
        <Box
          key={id}
          component="button"
          type="button"
          aria-label={label}
          onClick={() => handleClick(id)}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "0.5rem",
            p: 0,
            border: "none",
            background: "none",
            cursor: "pointer",
            "&:hover .overview-side-nav-dot": {
              transform: "scale(1.6)",
              backgroundColor: activeId === id ? brand600 : gray600,
            },
            "&:hover .overview-side-nav-label": {
              opacity: 1,
              transform: "translateX(0)",
            },
          }}
        >
          <Typography
            className="overview-side-nav-label"
            variant="body2"
            sx={{
              opacity: 0,
              transform: "translateX(0.5rem)",
              transition: "opacity 0.15s ease, transform 0.15s ease",
              color: gray800,
              whiteSpace: "nowrap",
              backgroundColor: "#fff",
              borderRadius: "0.25rem",
              px: "0.5rem",
              py: "0.125rem",
              boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
            }}
          >
            {label}
          </Typography>
          <Box
            className="overview-side-nav-dot"
            sx={{
              width: "0.625rem",
              height: "0.625rem",
              flexShrink: 0,
              borderRadius: "50%",
              transition: "transform 0.15s ease, background-color 0.15s ease",
              backgroundColor: activeId === id ? brand600 : gray300,
            }}
          />
        </Box>
      ))}
    </Box>
  );
};

OverviewSideNav.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default OverviewSideNav;
