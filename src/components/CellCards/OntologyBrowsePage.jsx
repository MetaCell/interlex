import { useCallback, useMemo, useState } from "react";
import { useOntologyData } from "./OntologyDataContext";
import { Container, Grid, Stack, Typography } from "@mui/material";
import OntologyHierarchyPanel from "./OntologyHierarchyPanel";
import OntologyTermsTable from "./OntologyTermsTable";
import CustomSingleSelect from "../common/CustomSingleSelect";
import {
  SUBCLASSES,
  SUPERCLASSES,
  browseTermHref,
  relationHierarchy,
  relationsIn,
  scopedTerms,
  termTypeCounts,
  termsOfType,
} from "./services/ontologyGridService";

// Not "": CustomSingleSelect reads an empty value as nothing chosen and shows its placeholder.
const ALL_TYPES = "all-types";

// How each hierarchy names itself: the relation that draws it, and what a term above or below
// another is called in it.
const RELATION_WORDING = {
  subClassOf: { predicate: "rdfs:subClassOf", sub: "sub classes", sup: "super classes", one: "super class" },
  subPropertyOf: {
    predicate: "rdfs:subPropertyOf",
    sub: "sub properties",
    sup: "super properties",
    one: "super property",
  },
};

const capitalized = (text) => text.charAt(0).toUpperCase() + text.slice(1);

// The opening view, with no term picked: every term, of the chosen type when there is one. Named
// after the ontology rather than as anything's sub classes — the document that scopes its terms is
// not a class above them.
const wholeOntology = (title, type) =>
  type ? `all ${type} terms in ${title}` : `all terms in ${title}`;

// Reading down includes the selected term (see `scopedTerms`); reading up does not.
const scopeCaption = (scope, termLabel, wording) =>
  scope === SUBCLASSES ? `${termLabel} and its ${wording.sub}` : `${wording.sup} of ${termLabel}`;

// The "Browse" tab: every term the ontology declares, whatever its type, next to the hierarchy
// that places them. One third / two thirds, matching the design's 576 / 1152 split of a 1760px
// container.
//
// The root class that restricts the grid never applies here. What narrows the view is the reader's
// own choice: one rdf:type out of those the ontology uses, and which hierarchy the tree draws —
// properties hang off rdfs:subPropertyOf, everything else off rdfs:subClassOf, and the two are
// never merged into one tree.
//
// The two panels are one view, not two: the term selected in the tree is what the table lists,
// read in the direction the table's "Show:" select names. Both halves therefore hang off state
// owned here, their common parent.
const OntologyBrowsePage = () => {
  const data = useOntologyData();
  const { meta, terms } = data;

  const [type, setType] = useState(ALL_TYPES);
  const [chosenRelation, setChosenRelation] = useState(null);
  // `selected` holds only an explicit choice; null is the opening view, the full list.
  const [selected, setSelected] = useState(null);
  const [scope, setScope] = useState(SUBCLASSES);

  const typeFilter = type === ALL_TYPES ? undefined : type;
  const typeOptions = useMemo(
    () => [
      { value: ALL_TYPES, label: `All types (${terms.length})` },
      ...termTypeCounts(terms).map((entry) => ({
        value: entry.type,
        label: `${entry.type} (${entry.count})`,
      })),
    ],
    [terms]
  );

  const typedTerms = useMemo(() => termsOfType(terms, typeFilter), [terms, typeFilter]);
  const relations = useMemo(() => relationsIn(typedTerms), [typedTerms]);
  // A type's terms may all sit in the other hierarchy than the one last chosen.
  const relation = relations.includes(chosenRelation) ? chosenRelation : relations[0];
  const wording = RELATION_WORDING[relation] || RELATION_WORDING.subClassOf;
  const hierarchy = useMemo(
    () => (relation ? relationHierarchy(typedTerms, relation) : { terms: [], roots: [] }),
    [typedTerms, relation]
  );

  const clearSelection = useCallback(() => {
    setSelected(null);
    setScope(SUBCLASSES);
  }, []);

  // A term picked in one tree is not a row of the next one.
  const changeType = useCallback(
    (next) => {
      setType(next);
      clearSelection();
    },
    [clearSelection]
  );
  const changeRelation = useCallback(
    (next) => {
      setChosenRelation(next);
      clearSelection();
    },
    [clearSelection]
  );

  const selectTerm = useCallback(
    (node) => setSelected({ termId: node.termId, label: node.label }),
    []
  );

  const listed = useMemo(
    () =>
      selected ? scopedTerms(hierarchy.terms, hierarchy.roots, selected.termId, scope) : typedTerms,
    [selected, hierarchy, scope, typedTerms]
  );

  const hrefFor = useCallback((term) => browseTermHref(data, term), [data]);

  // Side by side the two panels each own the full height and scroll internally. Once they
  // stack (below md) a full-height panel would push the other off-screen, so there they take
  // a fixed slice of the viewport and the page itself scrolls.
  const panelHeight = { xs: "32rem", md: 1 };

  return (
    <Container sx={{ flex: 1, minHeight: 0, overflowY: "auto", py: 3 }}>
      <Grid container spacing={4} sx={{ height: { md: 1 }, minHeight: 0 }}>
        <Grid item xs={12} md={4} sx={{ height: panelHeight, minHeight: 0 }}>
          <OntologyHierarchyPanel
            // Remounted per tree: the expansion of one hierarchy means nothing in another.
            key={`${relation}|${type}`}
            hierarchy={hierarchy.roots}
            anchorTermId={selected?.termId}
            type={type}
            typeOptions={typeOptions}
            onTypeChange={changeType}
            relation={relation}
            relationOptions={relations.map((value) => ({
              value,
              label: RELATION_WORDING[value].predicate,
            }))}
            onRelationChange={changeRelation}
            onSelectTerm={selectTerm}
            onClearSelection={clearSelection}
          />
        </Grid>
        <Grid item xs={12} md={8} sx={{ height: panelHeight, minHeight: 0 }}>
          <OntologyTermsTable
            terms={listed}
            hrefFor={hrefFor}
            scopeDescription={
              selected
                ? scopeCaption(scope, selected.label, wording)
                : wholeOntology(meta.title, typeFilter)
            }
            scopeControl={
              selected && (
                <Stack direction="row" alignItems="center" gap={1}>
                  <Typography variant="body2" color="text.secondary">
                    Show:
                  </Typography>
                  <CustomSingleSelect
                    value={scope}
                    onChange={setScope}
                    options={[
                      { value: SUBCLASSES, label: capitalized(wording.sub) },
                      { value: SUPERCLASSES, label: capitalized(wording.sup) },
                    ]}
                  />
                </Stack>
              )
            }
            // The table only ever runs out of rows reading upwards: reading down always holds at
            // least the selected term, so the other case left is an ontology with no terms at all.
            emptyMessage={
              selected
                ? `No term in this ontology is a ${wording.one} of ${selected.label}.`
                : "This ontology has no terms."
            }
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default OntologyBrowsePage;
