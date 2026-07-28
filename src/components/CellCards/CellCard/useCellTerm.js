import { useEffect, useState } from "react";
import { loadOntology, findCell } from "../services/ontologyGridService";
import { ONTOLOGY_CATALOG, DEFAULT_ONTOLOGY_SLUG } from "../config/gridConfig";

/**
 * Resolve one cell from a context ontology.
 *
 * The Cell Card lives on the term page, which is outside the ontology layout route, so it
 * cannot read the parsed graph off `useOutletContext`. It calls the same `loadOntology` the
 * grid uses instead: that memoizes both the ~16MB fetch and the parse at module level, so
 * arriving from a grid tile costs no network and no reparse, while a cold deep-link still
 * works on its own.
 *
 * The card's data never comes from the InterLex term API — Precision cells are npokb-only and
 * that endpoint 404s on them. `ontologySlug` is the *context* ontology (the `?ontology=` param
 * written by the grid), which is a different thing from `DataContext.activeOntology`: the
 * latter is an edit target, not a data source.
 */
const useCellTerm = (termSlug, ontologySlug = DEFAULT_ONTOLOGY_SLUG) => {
  const [state, setState] = useState({ cell: null, data: null, loading: true, error: null });

  useEffect(() => {
    const slug = ontologySlug && ONTOLOGY_CATALOG[ontologySlug] ? ontologySlug : DEFAULT_ONTOLOGY_SLUG;
    if (!termSlug) {
      setState({ cell: null, data: null, loading: false, error: null });
      return undefined;
    }

    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    loadOntology(slug)
      .then((data) => {
        if (!active) return;
        // A term that is not in this ontology is not an error — the tab simply has nothing to
        // show, and the caller renders/hides accordingly.
        setState({ cell: findCell(data, termSlug) || null, data, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ cell: null, data: null, loading: false, error });
      });

    return () => {
      active = false;
    };
  }, [termSlug, ontologySlug]);

  return state;
};

export default useCellTerm;
