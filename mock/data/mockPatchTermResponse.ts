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
  data : [
    {
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
    },
    {
      "@context": {
        "owl": "http://www.w3.org/2002/07/owl#",
        "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
        "xsd": "http://www.w3.org/2001/XMLSchema#"
      },
      "@graph": [
        {
          "@id": "http://uri.interlex.org/base/ilx_0105177",
          "http://uri.interlex.org/tgbugs/uris/readable/hasIlxId": {
            "@id": "http://uri.interlex.org/base/ilx_0105177"
          },
          "http://uri.interlex.org/tgbugs/uris/readable/hasIlxPreferredId": {
            "@id": "http://uri.interlex.org/base/ilx_0105177"
          },
          "http://uri.interlex.org/tgbugs/uris/readable/owlEquivalent": "owlEquivalent",
          "http://uri.interlex.org/tgbugs/uris/readable/lastModify": "lastModify",
          "http://uri.interlex.org/tgbugs/uris/readable/lastModifyBy": "lastModifyBy",
          "http://uri.interlex.org/tgbugs/uris/readable/submittedBy": "submittedBy"
        },
        {
          "@id": "http://uri.interlex.org/base/ontologies/ilx_0105177",
          "@type": "owl:Ontology",
          "http://purl.obolibrary.org/obo/IAO_0000136": {
            "@id": "http://uri.interlex.org/base/ilx_0105177"
          },
          "owl:versionIRI": {
            "@id": "http://uri.interlex.org/base/ontologies/ilx_0105177/version/1717612168/ilx_0105177"
          },
          "owl:versionInfo": "2024-06-05T18:29:28,829272Z",
          "rdfs:comment": "InterLex single term result for base/ilx_0105177 at 2024-06-05T18:29:28,829272Z"
        },
        {
          "@id": "http://purl.obolibrary.org/obo/UBERON_0001898",
          "@type": "owl:Class",
          "http://purl.obolibrary.org/obo/IAO_0000115": "Ventral part of the diencephalon extending from the region of the optic chiasm to the caudal border of the mammillary bodies and forming the inferior and lateral walls of the third ventricle.The ventral topographic division of the interbrain. The first adequate description of the hypothalamus as a layer of gray matter surrounding the lower half of the third ventricle (Galen, c173) was provided by Wharton (1656, see 1966 translation, p. 170). His (1893, pp. 159-162) introduced the term but assigned the preoptic region (Swanson, 1976, pp. 229-235) of the hypothalamus to the telencephalon (His, 1893b). The definition here was introduced for vertebrates by Kuhlenbeck (1927, p. 67, Ch. 9).",
          "http://uri.interlex.org/base/ilx_0112785": {
            "@id": "http://uri.interlex.org/base/ilx_0103217"
          },
          "http://uri.interlex.org/base/readable/synonym": [
            "Preoptico-hypothalamic area",
            "Hypencephalon",
            "Hy",
            "hypothalamus",
            "Preoptico-hypothalamic region"
          ],
          "http://uri.interlex.org/tgbugs/uris/readable/MISSING_ILX_ID": true,
          "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId": [
            {
              "@id": "http://purl.org/sig/ont/fma/fma62008"
            },
            {
              "@id": "http://uri.neuinfo.org/nif/nifstd/birnlex_734"
            },
            {
              "@id": "http://purl.obolibrary.org/obo/UBERON_0001898"
            }
          ],
          "http://uri.interlex.org/tgbugs/uris/readable/organization": "My Organization 2",
          "http://uri.interlex.org/tgbugs/uris/readable/status": "Edit",
          "rdfs:label": "Hypothalamus",
          "rdfs:subClassOf": {
            "@id": "http://uri.interlex.org/base/ilx_0109835"
          }
        }
      ]
    }
  ]
}
}
