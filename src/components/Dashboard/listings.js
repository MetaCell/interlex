import { ontologyEntryForUrl, ontologyPath } from "../CellCards/config/gridConfig";

// /{group}/contributions answers one [iri, label, lastModified] row per contribution, so a term
// edited twice is listed twice.
export const contributedTerms = (data) => {
  const seen = new Set();
  return (Array.isArray(data) ? data : [])
    .filter(([iri]) => {
      if (seen.has(iri)) return false;
      seen.add(iri);
      return true;
    })
    .map(([iri, label, lastModified]) => {
      const idMatch = iri.match(/((?:tmp|ilx)_\d+)/i);
      const termId = idMatch ? idMatch[1] : iri;
      const status = termId.toLowerCase().startsWith('tmp_') ? 'draft' : 'published';
      return { id: termId, iri, label, lastModified, status };
    });
};

// A readable label for each ontology /{group}/ontologies lists, falling back to the name its spec
// URI carries when it has no title.
export const listedOntologies = (data, group) =>
  (Array.isArray(data) ? data : []).map((ontology, index) => {
    let fallbackLabel = `Unknown Ontology ${ontology.id || index + 1}`;
    if (ontology.uri) {
      const uriParts = ontology.uri.split('/');
      const specIndex = uriParts.findIndex(part => part === 'spec');
      if (specIndex > 0) {
        fallbackLabel = `Ontology ${uriParts[specIndex - 1]}`;
      }
    }
    return {
      label: ontology.title || fallbackLabel,
      badge: group,
      id: ontology.id || `ontology-${index}`,
      description: ontology.uri,
      url: ontology.url,
    };
  });

export const UNROUTABLE_ONTOLOGY_MESSAGE = "This ontology has no address the ontology viewer can open.";

// Where the ontology viewer opens a listed ontology. Undefined when its spec URI is no address the
// viewer can read.
export const ontologyViewerPath = (ontology) => {
  const entry = ontologyEntryForUrl(ontology.description);
  return entry ? ontologyPath(entry) : undefined;
};
