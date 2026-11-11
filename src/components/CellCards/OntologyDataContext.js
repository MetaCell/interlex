import { createContext, useContext } from "react";

// The parsed ontology OntologyPage loaded, for the tab it renders. A context rather than the outlet
// context: an ontology addressed by its served path sits under a splat route, which cannot have tab
// child routes to carry an outlet.
export const OntologyDataContext = createContext(null);

export const useOntologyData = () => useContext(OntologyDataContext);
