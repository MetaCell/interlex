import { useEffect } from "react";
import { atom, useAtom, useSetAtom } from "jotai";
import { useParams } from "react-router-dom";
import {
  ONTOLOGY_CATALOG,
  ontologyForTermSlug,
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
 * first, then the atom, then a catalogued ontology claiming the slug's prefix. Null for an ordinary
 * InterLex term, which must not load one.
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

  return valid || stored || ontologyForTermSlug(termSlug) || null;
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
