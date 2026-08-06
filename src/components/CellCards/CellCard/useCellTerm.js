import { useEffect, useMemo, useState } from "react";
import { loadOntology, peekOntology, findCell } from "../services/ontologyGridService";
import { ONTOLOGY_CATALOG } from "../config/gridConfig";

/**
 * Resolve one cell from a context ontology.
 *
 * The Cell Card lives on the term page, which is outside the ontology layout route, so it
 * cannot read the parsed graph off `useOutletContext`. It calls the same `loadOntology` the
 * grid uses instead: that memoizes both the ~16MB fetch and the parse at module level, so
 * arriving from a grid tile costs no network and no reparse, while a cold deep-link still
 * works on its own.
 *
 * A parse already in that cache is resolved *during render* (`peekOntology`) rather than in the
 * effect. Going through the effect would report `loading` for one frame on every term change,
 * and that frame swaps the card for its skeleton — unmounting the widgets and losing their
 * state. The Ontology Hierarchy widget has to stay stationary while the rest of the card changes
 * around it (spec §3.2), which it cannot do if it is remounted on the way.
 *
 * The card's data never comes from the InterLex term API — Precision cells are npokb-only and
 * that endpoint 404s on them. `ontologySlug` is the context ontology, resolved by
 * `useContextOntologySlug`; null means there is none and nothing loads, so an ordinary InterLex
 * term never pays a ~16MB fetch to be told it is not a cell.
 */
const useCellTerm = (termSlug, ontologySlug) => {
  const slug = ontologySlug && ONTOLOGY_CATALOG[ontologySlug] ? ontologySlug : null;
  // Carries the slug it was resolved against, so a switch of context ontology cannot be served
  // the previous ontology's cell for the render before the effect runs.
  const [state, setState] = useState({ slug, cell: null, data: null, loading: Boolean(slug), error: null });
  const cached = slug ? peekOntology(slug) : undefined;

  useEffect(() => {
    if (!termSlug || !slug) {
      setState({ slug, cell: null, data: null, loading: false, error: null });
      return undefined;
    }
    // Already parsed: resolved synchronously below, so there is nothing to load or to flag.
    if (peekOntology(slug)) return undefined;

    let active = true;
    setState({ slug, cell: null, data: null, loading: true, error: null });

    loadOntology(slug)
      .then((data) => {
        if (!active) return;
        // A term that is not in this ontology is not an error — the tab simply has nothing to
        // show, and the caller renders/hides accordingly.
        setState({ slug, cell: findCell(data, termSlug) || null, data, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ slug, cell: null, data: null, loading: false, error });
      });

    return () => {
      active = false;
    };
  }, [termSlug, slug]);

  return useMemo(() => {
    // No context ontology: there is nothing to resolve against and nothing in flight.
    if (!slug) return { cell: null, data: null, loading: false, error: null };
    if (cached) {
      return {
        cell: termSlug ? findCell(cached, termSlug) || null : null,
        data: cached,
        loading: false,
        error: null,
      };
    }
    // State left over from another ontology says nothing about this one; the effect is loading it.
    if (state.slug !== slug) return { cell: null, data: null, loading: true, error: null };
    return { cell: state.cell, data: state.data, loading: state.loading, error: state.error };
  }, [cached, termSlug, slug, state]);
};

export default useCellTerm;
