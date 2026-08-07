import { useCallback, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Container, Grid } from "@mui/material";
import OntologyHierarchyPanel from "./OntologyHierarchyPanel";
import OntologyTermsTable from "./OntologyTermsTable";
import { SUBCLASSES, SUPERCLASSES, scopedCells } from "./services/ontologyGridService";

// Local name of a curie or IRI: "ilxtr:NeuronPrecision" -> "NeuronPrecision".
const localName = (id) => String(id).split(/[:/#]/).filter(Boolean).pop() || id;

// The "Type:" select names the direction *first*. These labels carry a term name that runs to 75
// characters, and the select is one control in a row that also holds a label, a divider and two
// buttons inside a one-third panel — so it ellipsises, and whatever trails the term name is the
// part the user loses. The one word that distinguishes the two options has to come before it.
const scopeOption = (scope, termLabel) =>
  `${scope === SUPERCLASSES ? "super" : "sub"} classes of ${termLabel}`;

// The caption over the table has a line to itself, so there it can be exact: reading down includes
// the selected class (see `scopedCells`), unless that class is the ontology's root, which is not
// one of its terms and so is never a row.
const scopeCaption = (scope, termLabel, anchorIsRoot) =>
  scope === SUBCLASSES && !anchorIsRoot
    ? `${termLabel} and its sub classes`
    : scopeOption(scope, termLabel);

// The "Browse" tab: the ontology's subClassOf hierarchy next to the terms it places.
// One third / two thirds, matching the design's 576 / 1152 split of a 1760px container.
//
// The two panels are one view, not two: the class selected in the tree is what the table lists,
// read in the direction the tree's "Type:" select names. (The MVP shipped them independent —
// `figma-grid-skeleton.md` §"do not interact" — which this supersedes.) Both halves therefore hang
// off state owned here, their common parent.
const OntologyBrowsePage = () => {
  const { data } = useOutletContext();
  const { entry, hierarchy, cells } = data;

  // The ontology's root class is the starting selection the design calls for, and reading down
  // from it is every term in the set — so the table opens on the full list, as it always has.
  // `selected` holds only an explicit choice; null is that default.
  const [selected, setSelected] = useState(null);
  const [scope, setScope] = useState(SUBCLASSES);

  const rootAnchor = useMemo(
    () => ({ termId: entry.rootClass, label: localName(entry.rootClass) }),
    [entry.rootClass]
  );
  const anchor = selected ?? rootAnchor;

  // Choosing the root again is choosing the default: the root node's own label is its bare curie
  // (it carries no rdfs:label), and letting that reach the select would rename the scope the user
  // is already looking at.
  const selectTerm = useCallback(
    (node) =>
      setSelected(
        node.termId === entry.rootClass ? null : { termId: node.termId, label: node.label }
      ),
    [entry.rootClass]
  );

  // Back to the opening view. Reading *up* from the root is the one scope that is empty by
  // definition — the root has nothing above it — so returning the anchor there returns the
  // direction too, rather than landing the user on a guaranteed-empty table.
  const selectRoot = useCallback(() => {
    setSelected(null);
    setScope(SUBCLASSES);
  }, []);

  const scopeOptions = useMemo(
    () =>
      [SUBCLASSES, SUPERCLASSES].map((value) => ({
        value,
        label: scopeOption(value, anchor.label),
      })),
    [anchor.label]
  );

  const terms = useMemo(() => scopedCells(data, anchor.termId, scope), [data, anchor.termId, scope]);

  // Side by side the two panels each own the full height and scroll internally. Once they
  // stack (below md) a full-height panel would push the other off-screen, so there they take
  // a fixed slice of the viewport and the page itself scrolls.
  const panelHeight = { xs: "32rem", md: 1 };

  return (
    <Container sx={{ flex: 1, minHeight: 0, overflowY: "auto", py: 3 }}>
      <Grid container spacing={4} sx={{ height: { md: 1 }, minHeight: 0 }}>
        <Grid item xs={12} md={4} sx={{ height: panelHeight, minHeight: 0 }}>
          <OntologyHierarchyPanel
            hierarchy={hierarchy}
            anchorTermId={anchor.termId}
            scope={scope}
            scopeOptions={scopeOptions}
            onScopeChange={setScope}
            onSelectTerm={selectTerm}
            onSelectRoot={selectRoot}
          />
        </Grid>
        <Grid item xs={12} md={8} sx={{ height: panelHeight, minHeight: 0 }}>
          <OntologyTermsTable
            cells={terms}
            entry={entry}
            scopeDescription={scopeCaption(scope, anchor.label, selected === null)}
            // The table only ever runs out of rows reading upwards: reading down always holds at
            // least the selected term, so the other case left is an ontology with no terms at all.
            emptyMessage={
              cells.length
                ? `No term in this ontology is a super class of ${anchor.label}.`
                : "This ontology has no terms."
            }
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default OntologyBrowsePage;
