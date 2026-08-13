// The mappings the views are currently rendering against, as an atom.
//
// Every widget on a Cell Card and every tile in the grid needs them, and threading them down as a
// prop meant `CellTileGrid`, `CellCard` and each widget's propTypes all carried a value none of
// them had an opinion about. They read this instead; the loaded ontology still carries `mappings`
// for the service layer and the pure helpers (`buildRows`, `buildRelationGraph`, `getFacets`),
// which take it as an argument because they run outside React — `yarn check-parser` executes them
// under plain node.
//
// Written by `loadOntology`, synchronously, before it resolves. That ordering matters: a `useEffect`
// publisher would run *after* the first render of the components below it, so a configuration that
// differs from the built-in one would show one frame of the wrong rows. Since no jotai `<Provider>`
// is mounted (see `useContextOntology`), the module default store is the one React reads, and a
// non-React caller can write it directly.
//
// One value, not one per ontology: the app shows a single ontology at a time and both entry points
// (the ontology layout route and the term page's `useCellTerm`) go through `loadOntology`, so the
// last load is the one on screen. It lives beside `mappingsService` rather than in `src/hooks/` to
// keep the configuration subsystem — fetch, defaults, delivery — in one place.

import { atom, getDefaultStore, useAtomValue } from "jotai";
import { DEFAULT_MAPPINGS } from "./mappingDefaults";
import type { OntologyMappings } from "../model/mappings";

export const mappingsAtom = atom<OntologyMappings>(DEFAULT_MAPPINGS);

/** Publish the mappings of the ontology just loaded. Safe to call repeatedly. */
export const publishMappings = (mappings: OntologyMappings): void => {
  const store = getDefaultStore();
  // Resolved mappings are cached per slug, so an unchanged configuration is the same object and
  // must not notify — that would re-render every tile on each navigation.
  if (store.get(mappingsAtom) !== mappings) store.set(mappingsAtom, mappings);
};

/** The current mappings, for components. */
export const useMappings = (): OntologyMappings => useAtomValue(mappingsAtom);
