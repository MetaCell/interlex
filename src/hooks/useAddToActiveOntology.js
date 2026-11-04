import { useCallback, useContext } from "react";
import { GlobalDataContext } from "../contexts/DataContext";
import { addEntityToOntology, getOntologyTerms } from "../api/endpoints/apiService";
import { reportApiError } from "../api/apiErrorBus";

// Adds a term to the active ontology, reporting a failure on the API error bus. On success the
// ontology's member list is re-read, so every "already in the ontology" check catches up.
// Resolves to whether the term was added.
export const useAddToActiveOntology = () => {
  const { activeOntology, setOntologyData } = useContext(GlobalDataContext);

  return useCallback(
    async (termId) => {
      const ontologyUri = activeOntology?.description || activeOntology?.url;
      if (!ontologyUri || !termId) return false;

      const result = await addEntityToOntology({ ontologyUri, termId });
      if (!result.success) {
        reportApiError({
          context: `Add term to ontology "${activeOntology.label}"`,
          url: result.url || ontologyUri,
          status: result.status,
          message: result.body || result.error || "Request failed with no body.",
        });
        return false;
      }

      getOntologyTerms(ontologyUri)
        .then((terms) => setOntologyData({ ...activeOntology, terms }))
        .catch(() => {});
      return true;
    },
    [activeOntology, setOntologyData]
  );
};
