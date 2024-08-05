import { mockTerm, mockTerms } from "./mockTerms";

export const mockPatchTermResponse = () =>  { return {
  status: 200,
  data : {
    "@context": {
      "owl": "http://www.w3.org/2002/07/owl#",
      "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
      "xsd": "http://www.w3.org/2001/XMLSchema#"
    },
    "@graph": [
      {
        "@id": "http://uri.interlex.org/base/ilx_0101431",
        "http://uri.interlex.org/tgbugs/uris/readable/hasIlxId": {
          "@id": "http://uri.interlex.org/base/ilx_0101431"
        },
        "http://uri.interlex.org/tgbugs/uris/readable/hasIlxPreferredId": {
          "@id": "http://uri.interlex.org/base/ilx_0101431"
        },
        "http://uri.interlex.org/tgbugs/uris/readable/owlEquivalent": "owlEquivalent",
        "http://uri.interlex.org/tgbugs/uris/readable/lastModify": "lastModify",
        "http://uri.interlex.org/tgbugs/uris/readable/lastModifyBy": "lastModifyBy",
        "http://uri.interlex.org/tgbugs/uris/readable/submittedBy": "submittedBy"
      },
      {
        "@id": "http://uri.interlex.org/base/ontologies/ilx_0101431",
        "@type": "owl:Ontology",
        "http://purl.obolibrary.org/obo/IAO_0000136": {
          "@id": "http://uri.interlex.org/base/ilx_0101431"
        },
        "owl:versionIRI": {
          "@id": "http://uri.interlex.org/base/ontologies/ilx_0101431/version/1717611398/ilx_0101431"
        },
        "owl:versionInfo": "2024-06-05T18:16:38,089335Z",
        "rdfs:comment": "InterLex single term result for base/ilx_0101431 at 2024-06-05T18:16:38,089335Z"
      },
      {
        "@id": "http://purl.obolibrary.org/obo/UBERON_0000955",
        "@type": "owl:Class",
        "http://purl.obolibrary.org/obo/IAO_0000115": "The part of the central nervous system contained within the cranium, comprising the forebrain, midbrain, hindbrain, and metencephalon. It is derived from the anterior part of the embryonic neural tube (or the encephalon). Does not include retina. (CUMBO)The rostral topographic division of the cerebrospinal axis, while the caudal division is the spinal cord. The usual criterion for distinguishing the two divisions in the adult is that the vertebrate brain lies within the skull whereas the spinal cord lies within the spinal (vertebral) column, although this is a difficult problem. (Swanson, 2014)",
        "http://uri.interlex.org/base/ilx_0112784": {
          "@id": "http://uri.interlex.org/base/ilx_0102661"
        },
        "http://uri.interlex.org/base/ilx_0112785": {
          "@id": "http://uri.interlex.org/base/ilx_0101999"
        },
        "http://uri.interlex.org/base/ilx_0112796": {
          "@id": "http://uri.interlex.org/base/ilx_0101901"
        },
        "http://uri.interlex.org/base/readable/synonym": [
          "Encephalon",
          "synganglion",
          "the brain",
          "suprasegmental levels of nervous system",
          "suprasegmental structures"
        ],
        "http://uri.interlex.org/tgbugs/uris/readable/MISSING_ILX_ID": true,
        "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId": [
          {
            "@id": "http://uri.neuinfo.org/nif/nifstd/birnlex_796"
          },
          {
            "@id": "http://purl.org/sig/ont/fma/fma50801"
          },
          {
            "@id": "http://purl.obolibrary.org/obo/UBERON_0000955"
          }
        ],
        "http://uri.interlex.org/tgbugs/uris/readable/organization": "My Organization",
        "http://uri.interlex.org/tgbugs/uris/readable/status": "Approved",
        "rdfs:label": "Brain",
        "rdfs:subClassOf": {
          "@id": "http://uri.interlex.org/base/ilx_0108124"
        }
      }
    ]
  }
}
}

export const mockPatchBulkTermsResponse = () =>  { return {
  status: 200,
  data : mockTerms
}
}
