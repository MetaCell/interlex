import { useContext, useMemo } from "react";
import PropTypes from "prop-types";
import { Chip, Tooltip } from "@mui/material";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import { GlobalDataContext } from "../../contexts/DataContext";
import { compactIri, contextPrefixes, isIri, toIri } from "../../parsers/neurdfParser";

// Past this an IRI no prefix covers no longer fits a chip, so only its local part is shown.
const MAX_IRI_LABEL_LENGTH = 20;

// The term's own @context names the ids it uses, so it wins; the server's base curies cover the
// views that arrive without one (version snapshots, the term editor).
const usePrefixTables = (context) => {
  const { curies } = useContext(GlobalDataContext);
  return useMemo(
    () => [
      contextPrefixes(context),
      Object.fromEntries((curies?.base || []).map(({ prefix, namespace }) => [prefix, namespace])),
    ],
    [context, curies]
  );
};

const firstOf = (prefixTables, convert) =>
  prefixTables.map((prefixes) => convert(prefixes)).find(Boolean);

const describeIri = (id, prefixTables) => {
  if (!isIri(id)) {
    return { label: id, href: firstOf(prefixTables, (prefixes) => toIri(id, prefixes)) || "" };
  }
  const curie = firstOf(prefixTables, (prefixes) => compactIri(id, prefixes));
  if (curie) return { label: curie, href: id };
  if (id.length <= MAX_IRI_LABEL_LENGTH) return { label: id, href: id };
  return { label: id.split(/[/#]/).filter(Boolean).pop() || id, href: id };
};

const IriChip = ({ iri, context, onDelete, ...chipProps }) => {
  const { label, href } = describeIri(iri, usePrefixTables(context));
  const fullIri = href || iri;
  // A deletable chip is not a link: its delete icon sits inside the anchor, so a click on it would
  // also navigate away from the edit.
  const linkProps = href && !onDelete
    ? { component: "a", href, target: "_blank", rel: "noopener noreferrer", clickable: true, icon: <OpenInNewOutlinedIcon /> }
    : {};
  return (
    <Tooltip title={label === fullIri ? "" : fullIri} arrow>
      <Chip variant="outlined" label={label} onDelete={onDelete} {...linkProps} {...chipProps} />
    </Tooltip>
  );
};

IriChip.propTypes = {
  iri: PropTypes.string.isRequired,
  context: PropTypes.object,
  onDelete: PropTypes.func,
};

export default IriChip;
