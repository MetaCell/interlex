import { useEffect } from "react";
import { atom, useAtom, useSetAtom } from "jotai";
import { useParams } from "react-router-dom";
import {
  ONTOLOGY_CATALOG,
  ontologyForTermSlug,
  isIlxTermSlug,
} from "../components/CellCards/config/gridConfig";
import useCellTerm from "../components/CellCards/CellCard/useCellTerm";

/**
 * The ontology the user is currently reading — the *context ontology*, a data source. Not
 * `DataContext.activeOntology`, which is an edit target.
 *
 * Holds the ontology's identity only; the parse itself stays in `ontologyGridService`'s module
 * cache, shared with the grid. No jotai `<Provider>` is mounted, so this is the module default
 * store and a non-React reader can reach it with `getDefaultStore()`.
 */
export const contextOntologyAtom = atom(null);

/** Publish the ontology a route *is*, so terms opened from it inherit the context. */
export const usePublishContextOntology = (slug) => {
  const setSlug = useSetAtom(contextOntologyAtom);
  useEffect(() => {
    if (slug && ONTOLOGY_CATALOG[slug]) setSlug(slug);
  }, [slug, setSlug]);
};

/**
 * Which ontology is in context for this term: the `/ontology/{slug}/` the path was opened under
 * first — an explicit route beats every fallback below, including for an `ilx_`/`tmp_` slug that
 * has been mapped to a catalogued ontology's cell and is being read on its ontology-scoped route.
 * Absent that, a catalogued ontology claiming the slug's own prefix, then the atom (the last
 * ontology route visited this session). Null for an ordinary InterLex term read on its plain
 * route, which must not load one.
 *
 * The prefix match outranks the atom — a term that names a specific ontology by construction must
 * resolve to that one even if the atom is still holding an unrelated ontology from an earlier
 * page — and an `ilx_`/`tmp_` slug short-circuits to null rather than falling through to the atom:
 * it addresses an ordinary InterLex term by construction, so on its plain route the atom (which
 * nothing ever clears) must not get a vote for it either.
 *
 * The URL wins and is read synchronously so a shared deep link resolves on its first render; the
 * sync is one-way (URL -> atom), leaving react-router the only writer of the URL.
 */
export const useContextOntologySlug = (termSlug) => {
  const [stored, setStored] = useAtom(contextOntologyAtom);
  const { ontologySlug: fromUrl } = useParams();
  const valid = fromUrl && ONTOLOGY_CATALOG[fromUrl] ? fromUrl : null;

  useEffect(() => {
    if (valid && valid !== stored) setStored(valid);
  }, [valid, stored, setStored]);

  if (valid) return valid;
  if (isIlxTermSlug(termSlug)) return null;
  return ontologyForTermSlug(termSlug) || stored || null;
};

/**
 * The term as the context ontology describes it — the seam the page header, the tab bar, the
 * Overview and the Cell Card all read, so none of them has to tell the others what it found.
 *
 * `cell` null with `loading` false means "no ontology record": fall back to the InterLex term API.
 */
export const useContextTerm = (termSlug) => {
  const ontologySlug = useContextOntologySlug(termSlug);
  const { cell, data, loading, error } = useCellTerm(termSlug, ontologySlug);
  return { ontologySlug, ontology: data, cell, loading, error };
};

export default useContextTerm;
