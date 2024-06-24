# Interlex API Docs

This template provides instructions on how to use the API.

- [API - Search for Terms](https://github.com/MetaCell/interlex/tree/feature/ILEX-22/src/api#searching-for-terms)
- [API - Get Curies](https://github.com/MetaCell/interlex/tree/feature/ILEX-22/src/api#retrieving-curies)
- [API - Get Single Term](https://github.com/MetaCell/interlex/tree/feature/ILEX-22/src/api#retrieving-single-term)
- [API - Get Variants](https://github.com/MetaCell/interlex/tree/feature/ILEX-22/src/api#retrieving-variants)
- [API - Get Versions](https://github.com/MetaCell/interlex/tree/feature/ILEX-22/src/api#retrieving-versions)
- [API - Get Raw Data](https://github.com/MetaCell/interlex/tree/feature/ILEX-22/src/api#retrieving-raw-data)


### Searching for Terms
- Sample Code 
```
import * as mockApi from 'src/api/endpoints/swaggerMockMissingEndpoints';
import { termParser } from 'src/parsers/termParser'
const useMockApi = () => mockApi;

const Test = () => {
    const {  getMatchTerms } = useMockApi();
    const [terms, setTerms] = React.useState([]);

    React.useEffect( () => {
        // Call endpoint to retrieve terms that match search word
        getMatchTerms("i").then(data => { 
            const parsedData = termParser(data, searchTerm)
            console.log("Parsed retrieved data : ", parsedData)
            setTerms(parsedData)
        });
    }, [])

    render ();
};
```

- Sample Search Return
```
{
    "filters": {
        "Organizations": {},
        "Type": {
            "owl:Ontology": {
                "label": "owl:Ontology",
                "ids": [
                    "http://uri.interlex.org/base/ilx_0101431",
                    "http://uri.interlex.org/base/ontologies/ilx_0103217",
                    "http://uri.interlex.org/base/ontologies/ilx_0100741",
                    "http://uri.interlex.org/base/ontologies/ilx_0789705"
                ]
            },
            "owl:Class": {
                "label": "owl:Class",
                "ids": [
                    "http://purl.obolibrary.org/obo/UBERON_0003217",
                    "http://uri.interlex.org/base/ilx_0101999"
                ]
            },
            "owl:ObjectProperty": {
                "label": "owl:ObjectProperty",
                "ids": [
                    "http://uri.interlex.org/base/ilx_0738400"
                ]
            }
        },
        "Superclass": {
            "http://uri.interlex.org/base/ilx_0108124": {
                "label": "http://uri.interlex.org/base/ilx_0108124",
                "ids": [
                    "http://uri.interlex.org/base/ilx_0101431"
                ]
            },
            "http://uri.interlex.org/base/ilx_0109835": {
                "label": "http://uri.interlex.org/base/ilx_0109835",
                "ids": [
                    "http://uri.interlex.org/base/ontologies/ilx_0103217",
                    "http://purl.obolibrary.org/obo/UBERON_0003217",
                    "http://uri.interlex.org/base/ontologies/ilx_0100741",
                    "http://uri.interlex.org/base/ilx_0101999"
                ]
            }
        },
        "Ancestor": {}
    },
    "results": [
        {
            "id": "http://uri.interlex.org/base/ilx_0101431",
            "hasIlxId": "http://uri.interlex.org/base/ilx_0101431",
            "hasIlxPreferredId": "http://uri.interlex.org/base/ilx_0101431",
            "type": "owl:Ontology",
            "versionIRI": "http://uri.interlex.org/base/ontologies/ilx_0101431/version/1717611398/ilx_0101431",
            "versionInfo": "2024-06-05T18:16:38,089335Z",
            "description": "The part of the central nervous system contained within the cranium, comprising the forebrain, midbrain, hindbrain, and metencephalon. It is derived from the anterior part of the embryonic neural tube (or the encephalon). Does not include retina. (CUMBO)The rostral topographic division of the cerebrospinal axis, while the caudal division is the spinal cord. The usual criterion for distinguishing the two divisions in the adult is that the vertebrate brain lies within the skull whereas the spinal cord lies within the spinal (vertebral) column, although this is a difficult problem. (Swanson, 2014)",
            "synonym": [
                "Encephalon",
                "synganglion",
                "the brain",
                "suprasegmental levels of nervous system",
                "suprasegmental structures"
            ],
            "existingID": [
                "http://uri.neuinfo.org/nif/nifstd/birnlex_796",
                "http://purl.org/sig/ont/fma/fma50801",
                "http://purl.obolibrary.org/obo/UBERON_0000955"
            ],
            "organization": "My Organization",
            "status": "Approved",
            "label": "Brain",
            "subClassOf": "http://uri.interlex.org/base/ilx_0108124",
            "predicates": {
                "http://uri.interlex.org/base/readable/synonym": [
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ilx_0101431",
                            "label": "Brain"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "Encephalon"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ilx_0101431",
                            "label": "Brain"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "synganglion"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ilx_0101431",
                            "label": "Brain"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "the brain"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ilx_0101431",
                            "label": "Brain"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "suprasegmental levels of nervous system"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ilx_0101431",
                            "label": "Brain"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "suprasegmental structures"
                        }
                    }
                ],
                "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId": [
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ilx_0101431",
                            "label": "Brain"
                        },
                        "predicate": "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId",
                        "object": {
                            "value": "http://uri.neuinfo.org/nif/nifstd/birnlex_796"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ilx_0101431",
                            "label": "Brain"
                        },
                        "predicate": "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId",
                        "object": {
                            "value": "http://purl.org/sig/ont/fma/fma50801"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ilx_0101431",
                            "label": "Brain"
                        },
                        "predicate": "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId",
                        "object": {
                            "value": "http://purl.obolibrary.org/obo/UBERON_0000955"
                        }
                    }
                ],
                "rdfs:subClassOf": [
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ilx_0101431",
                            "label": "Brain"
                        },
                        "predicate": "rdfs:subClassOf",
                        "object": {
                            "id": "http://uri.interlex.org/base/ilx_0108124"
                        }
                    }
                ]
            }
        },
        {
            "id": "http://uri.interlex.org/base/ontologies/ilx_0103217",
            "type": "owl:Ontology",
            "versionIRI": "http://uri.interlex.org/base/ontologies/ilx_0103217/version/1717612232/ilx_0103217",
            "versionInfo": "2024-06-05T18:30:32,606863Z",
            "description": "Part of the brain consisting of the paired caudal parts of the prosencephalon from which the Thalamus; Hypothalamus; Epithalamus; and Subthalamus are derived.(MeSH)",
            "synonym": [
                "DiE",
                "betweenbrain",
                "Mature diencephalon",
                "diencephalon",
                "thalamencephalon",
                "Between brain",
                "Interbrain"
            ],
            "existingID": [
                "http://purl.obolibrary.org/obo/UBERON_0001894",
                "http://purl.org/sig/ont/fma/fma62001",
                "http://uri.neuinfo.org/nif/nifstd/birnlex_1503"
            ],
            "organization": "My Organization",
            "status": "Approved",
            "label": "Diencephalon",
            "subClassOf": "http://uri.interlex.org/base/ilx_0109835",
            "hasIlxId": "http://uri.interlex.org/base/ilx_0103217",
            "hasIlxPreferredId": "http://uri.interlex.org/base/ilx_0103217",
            "predicates": {
                "http://uri.interlex.org/base/readable/synonym": [
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ontologies/ilx_0103217",
                            "label": "Diencephalon"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "DiE"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ontologies/ilx_0103217",
                            "label": "Diencephalon"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "betweenbrain"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ontologies/ilx_0103217",
                            "label": "Diencephalon"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "Mature diencephalon"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ontologies/ilx_0103217",
                            "label": "Diencephalon"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "diencephalon"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ontologies/ilx_0103217",
                            "label": "Diencephalon"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "thalamencephalon"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ontologies/ilx_0103217",
                            "label": "Diencephalon"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "Between brain"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ontologies/ilx_0103217",
                            "label": "Diencephalon"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "Interbrain"
                        }
                    }
                ],
                "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId": [
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ontologies/ilx_0103217",
                            "label": "Diencephalon"
                        },
                        "predicate": "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId",
                        "object": {
                            "value": "http://purl.obolibrary.org/obo/UBERON_0001894"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ontologies/ilx_0103217",
                            "label": "Diencephalon"
                        },
                        "predicate": "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId",
                        "object": {
                            "value": "http://purl.org/sig/ont/fma/fma62001"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ontologies/ilx_0103217",
                            "label": "Diencephalon"
                        },
                        "predicate": "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId",
                        "object": {
                            "value": "http://uri.neuinfo.org/nif/nifstd/birnlex_1503"
                        }
                    }
                ],
                "rdfs:subClassOf": [
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ontologies/ilx_0103217",
                            "label": "Diencephalon"
                        },
                        "predicate": "rdfs:subClassOf",
                        "object": {
                            "id": "http://uri.interlex.org/base/ilx_0109835"
                        }
                    }
                ]
            }
        },
        {
            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
            "type": "owl:Class",
            "description": "The posterior pituitary (or neurohypophysis) comprises the posterior lobe of the pituitary gland and is part of the endocrine system. Despite its name, the posterior pituitary gland is not a gland, per se; rather, it is largely a collection of axonal projections from the hypothalamus that terminate behind the anterior pituitary gland. [WP,unvetted].",
            "synonym": [
                "Pars nervosa of posterior lobe of pituitary gland",
                "eminentia medialis (Shantha)",
                "Pars nervosa of hypophysis",
                "posterior lobe",
                "neural component of pituitary",
                "posterior lobe-3",
                "pars posterior",
                "eminentia mediana",
                "Pars nervosa pituitary gland",
                "pituitary gland",
                "PNHP",
                "pars nervosa of pituitary",
                "pars nervosa (hypophysis)",
                "pars nervosa neurohypophysis",
                "pars nervosa of neurohypophysis",
                "Posterior pituitary",
                "lobus nervosus (Neurohypophysis)",
                "eminentia postinfundibularis",
                "pars nervosa",
                "Posterior lobe of pituitary",
                "Pituitary gland, posterior lobe",
                "lobe caudalis cerebelli",
                "middle lobe",
                "pars nervosa (neurohypophysis)",
                "pars posterior of hypophysis",
                "medial eminence",
                "posterior lobe of neurohypophysis",
                "caudal lobe"
            ],
            "existingID": [
                "http://purl.obolibrary.org/obo/UBERON_0003217",
                "http://purl.org/sig/ont/fma/fma74636",
                "http://uri.neuinfo.org/nif/nifstd/birnlex_941"
            ],
            "organization": "My Organization",
            "status": "Approved",
            "label": "Pars nervosa of hypophysis",
            "subClassOf": "http://uri.interlex.org/base/ilx_0109835",
            "versionIRI": "http://uri.interlex.org/base/ontologies/ilx_0108544/version/1717612292/ilx_0108544",
            "versionInfo": "2024-06-05T18:31:32,202358Z",
            "hasIlxId": "http://uri.interlex.org/base/ilx_0108544",
            "hasIlxPreferredId": "http://uri.interlex.org/base/ilx_0108544",
            "predicates": {
                "http://uri.interlex.org/base/readable/synonym": [
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "Pars nervosa of posterior lobe of pituitary gland"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "eminentia medialis (Shantha)"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "Pars nervosa of hypophysis"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "posterior lobe"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "neural component of pituitary"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "posterior lobe-3"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "pars posterior"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "eminentia mediana"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "Pars nervosa pituitary gland"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "pituitary gland"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "PNHP"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "pars nervosa of pituitary"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "pars nervosa (hypophysis)"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "pars nervosa neurohypophysis"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "pars nervosa of neurohypophysis"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "Posterior pituitary"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "lobus nervosus (Neurohypophysis)"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "eminentia postinfundibularis"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "pars nervosa"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "Posterior lobe of pituitary"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "Pituitary gland, posterior lobe"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "lobe caudalis cerebelli"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "middle lobe"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "pars nervosa (neurohypophysis)"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "pars posterior of hypophysis"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "medial eminence"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "posterior lobe of neurohypophysis"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "caudal lobe"
                        }
                    }
                ],
                "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId": [
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId",
                        "object": {
                            "value": "http://purl.obolibrary.org/obo/UBERON_0003217"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId",
                        "object": {
                            "value": "http://purl.org/sig/ont/fma/fma74636"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId",
                        "object": {
                            "value": "http://uri.neuinfo.org/nif/nifstd/birnlex_941"
                        }
                    }
                ],
                "rdfs:subClassOf": [
                    {
                        "subject": {
                            "id": "http://purl.obolibrary.org/obo/UBERON_0003217",
                            "label": "Pars nervosa of hypophysis"
                        },
                        "predicate": "rdfs:subClassOf",
                        "object": {
                            "id": "http://uri.interlex.org/base/ilx_0109835"
                        }
                    }
                ]
            }
        },
        {
            "id": "http://uri.interlex.org/base/ontologies/ilx_0100741",
            "type": "owl:Ontology",
            "versionIRI": "http://uri.interlex.org/base/ontologies/ilx_0100741/version/1717612348/ilx_0100741",
            "versionInfo": "2024-06-05T18:32:28,622371Z",
            "description": "'Anterior pretectal nucleus' is a nucleus of midbrain tectum and pretectal nucleus.",
            "synonym": [
                "anterior pretectal nucleus",
                "anterior (ventral /principal) pretectal nucleus"
            ],
            "existingID": [
                "http://purl.obolibrary.org/obo/UBERON_0034918",
                "http://uri.neuinfo.org/nif/nifstd/nlx_144456"
            ],
            "organization": "Interlex Lab",
            "status": "Imported",
            "label": "Anterior pretectal nucleus",
            "subClassOf": "http://uri.interlex.org/base/ilx_0109835",
            "hasIlxId": "http://uri.interlex.org/base/ilx_0100741",
            "hasIlxPreferredId": "http://uri.interlex.org/base/ilx_0100741",
            "predicates": {
                "http://uri.interlex.org/base/readable/synonym": [
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ontologies/ilx_0100741",
                            "label": "Anterior pretectal nucleus"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "anterior pretectal nucleus"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ontologies/ilx_0100741",
                            "label": "Anterior pretectal nucleus"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "anterior (ventral /principal) pretectal nucleus"
                        }
                    }
                ],
                "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId": [
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ontologies/ilx_0100741",
                            "label": "Anterior pretectal nucleus"
                        },
                        "predicate": "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId",
                        "object": {
                            "value": "http://purl.obolibrary.org/obo/UBERON_0034918"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ontologies/ilx_0100741",
                            "label": "Anterior pretectal nucleus"
                        },
                        "predicate": "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId",
                        "object": {
                            "value": "http://uri.neuinfo.org/nif/nifstd/nlx_144456"
                        }
                    }
                ],
                "rdfs:subClassOf": [
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ontologies/ilx_0100741",
                            "label": "Anterior pretectal nucleus"
                        },
                        "predicate": "rdfs:subClassOf",
                        "object": {
                            "id": "http://uri.interlex.org/base/ilx_0109835"
                        }
                    }
                ]
            }
        },
        {
            "id": "http://uri.interlex.org/base/ontologies/ilx_0789705",
            "type": "owl:Ontology",
            "versionIRI": "http://uri.interlex.org/base/ontologies/ilx_0789705/version/1717612384/ilx_0789705",
            "versionInfo": "2024-06-05T18:33:04,971876Z",
            "label": "Right vagus nerve",
            "organization": "My Organization",
            "status": "Approved",
            "hasIlxId": "http://uri.interlex.org/base/ilx_0789705",
            "hasIlxPreferredId": "http://uri.interlex.org/base/ilx_0789705",
            "synonym": [
                "Right vagus nerve tree",
                "Right vagus"
            ],
            "existingID": "http://purl.org/sig/ont/fma/fma6219",
            "predicates": {
                "http://uri.interlex.org/base/readable/synonym": [
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ontologies/ilx_0789705",
                            "label": "Right vagus nerve"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "Right vagus nerve tree"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ontologies/ilx_0789705",
                            "label": "Right vagus nerve"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "Right vagus"
                        }
                    }
                ],
                "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId": [
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ontologies/ilx_0789705",
                            "label": "Right vagus nerve"
                        },
                        "predicate": "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId",
                        "object": {
                            "id": "http://purl.org/sig/ont/fma/fma6219"
                        }
                    }
                ]
            }
        },
        {
            "id": "http://uri.interlex.org/base/ilx_0738400",
            "type": "owl:ObjectProperty",
            "description": "A relationship that binds a term to the required entities for the purposes required by SPARC, e.g., returning a term in response to a query for all relevant organ parts when it is not specified in the core ontology.  We view this as a temporary and practical solution.  At some points, all such terms will be contributed back to the core ontologies for proper engineering.",
            "label": "includeForSPARC",
            "organization": "My Organization 2",
            "status": "Edit",
            "versionInfo": "2024-06-05T18:33:20,330454Z",
            "versionIRI": "http://uri.interlex.org/base/ontologies/ilx_0738400/version/1717612400/ilx_0738400",
            "predicates": {}
        },
        {
            "id": "http://uri.interlex.org/base/ilx_0101999",
            "hasIlxId": "http://uri.interlex.org/base/ilx_0101999",
            "hasIlxPreferredId": "http://uri.interlex.org/base/ilx_0101999",
            "type": "owl:Class",
            "description": "The hollow tubular division of the nervous system that lies in the median plane, dorsal to a notochord and flanked by a bilateral series of segmental muscles.It is the topographic division that corresponds to the vertebrate central nervous system.",
            "synonym": "CSA",
            "existingID": "http://uri.neuinfo.org/nif/nifstd/nlx_158477",
            "organization": "Interlex Lab",
            "status": "Approved",
            "label": "Cerebrospinal axis",
            "subClassOf": "http://uri.interlex.org/base/ilx_0109835",
            "versionIRI": "http://uri.interlex.org/base/ontologies/ilx_0101999/version/1717612416/ilx_0101999",
            "versionInfo": "2024-06-05T18:33:36,655319Z",
            "predicates": {
                "http://uri.interlex.org/base/readable/synonym": [
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ilx_0101999",
                            "label": "Cerebrospinal axis"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "id": "CSA"
                        }
                    }
                ],
                "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId": [
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ilx_0101999",
                            "label": "Cerebrospinal axis"
                        },
                        "predicate": "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId",
                        "object": {
                            "id": "http://uri.neuinfo.org/nif/nifstd/nlx_158477"
                        }
                    }
                ],
                "rdfs:subClassOf": [
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ilx_0101999",
                            "label": "Cerebrospinal axis"
                        },
                        "predicate": "rdfs:subClassOf",
                        "object": {
                            "id": "http://uri.interlex.org/base/ilx_0109835"
                        }
                    }
                ]
            }
        }
    ]
}
```

### Retrieving Single Term
- Sample Code
```
import * as mockApi from './../../api/endpoints/interLexURIStructureAPI';
import { termParser } from 'src/parsers/termParser'

const useMockApi = () => mockApi;

const Test = () => {
    const { getEndpointsIlx } = useMockApi();

    React.useEffect( () => {
        getEndpointsIlx("base", "ilx_0101431").then(data => { 
            const parsedData = termParser(data)
            console.log("Parsed retrieved terms : ", parsedData)
        });
    }, [])

    render ();
};
```

- Sample Return
```
        {
            "id": "http://uri.interlex.org/base/ilx_0101431",
            "hasIlxId": "http://uri.interlex.org/base/ilx_0101431",
            "hasIlxPreferredId": "http://uri.interlex.org/base/ilx_0101431",
            "type": "owl:Ontology",
            "versionIRI": "http://uri.interlex.org/base/ontologies/ilx_0101431/version/1717611398/ilx_0101431",
            "versionInfo": "2024-06-05T18:16:38,089335Z",
            "description": "The part of the central nervous system contained within the cranium, comprising the forebrain, midbrain, hindbrain, and metencephalon. It is derived from the anterior part of the embryonic neural tube (or the encephalon). Does not include retina. (CUMBO)The rostral topographic division of the cerebrospinal axis, while the caudal division is the spinal cord. The usual criterion for distinguishing the two divisions in the adult is that the vertebrate brain lies within the skull whereas the spinal cord lies within the spinal (vertebral) column, although this is a difficult problem. (Swanson, 2014)",
            "synonym": [
                "Encephalon",
                "synganglion",
                "the brain",
                "suprasegmental levels of nervous system",
                "suprasegmental structures"
            ],
            "existingID": [
                "http://uri.neuinfo.org/nif/nifstd/birnlex_796",
                "http://purl.org/sig/ont/fma/fma50801",
                "http://purl.obolibrary.org/obo/UBERON_0000955"
            ],
            "organization": "My Organization",
            "status": "Approved",
            "label": "Brain",
            "subClassOf": "http://uri.interlex.org/base/ilx_0108124",
            "predicates": {
                "http://uri.interlex.org/base/readable/synonym": [
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ilx_0101431",
                            "label": "Brain"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "Encephalon"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ilx_0101431",
                            "label": "Brain"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "synganglion"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ilx_0101431",
                            "label": "Brain"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "the brain"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ilx_0101431",
                            "label": "Brain"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "suprasegmental levels of nervous system"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ilx_0101431",
                            "label": "Brain"
                        },
                        "predicate": "http://uri.interlex.org/base/readable/synonym",
                        "object": {
                            "value": "suprasegmental structures"
                        }
                    }
                ],
                "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId": [
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ilx_0101431",
                            "label": "Brain"
                        },
                        "predicate": "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId",
                        "object": {
                            "value": "http://uri.neuinfo.org/nif/nifstd/birnlex_796"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ilx_0101431",
                            "label": "Brain"
                        },
                        "predicate": "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId",
                        "object": {
                            "value": "http://purl.org/sig/ont/fma/fma50801"
                        }
                    },
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ilx_0101431",
                            "label": "Brain"
                        },
                        "predicate": "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId",
                        "object": {
                            "value": "http://purl.obolibrary.org/obo/UBERON_0000955"
                        }
                    }
                ],
                "rdfs:subClassOf": [
                    {
                        "subject": {
                            "id": "http://uri.interlex.org/base/ilx_0101431",
                            "label": "Brain"
                        },
                        "predicate": "rdfs:subClassOf",
                        "object": {
                            "id": "http://uri.interlex.org/base/ilx_0108124"
                        }
                    }
                ]
            }
        }
```

### Retrieving Curies
- Sample Code
```
import * as mockApi from './../../api/endpoints/swaggerMockMissingEndpoints';
import { curieParser } from 'src/parsers/termParser'

const useMockApi = () => mockApi;

const Test = () => {
    const { getCuries } = useMockApi();

    React.useEffect( () => {
        getCuries("base").then(data => { 
            const parsedData = curieParser(data)
            console.log("Parsed retrieved curies : ", parsedData)
        });
    }, [])

    render ();
};
```

- Sample Return
```
[
    {
        "namespace": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "prefix": "rdf"
    },
    {
        "namespace": "http://www.w3.org/2000/01/rdf-schema#",
        "prefix": "rdfs"
    },
    {
        "namespace": "http://www.w3.org/2002/07/owl#",
        "prefix": "owl"
    }
]
```

### Retrieving Variants
- Sample Code
```
import * as mockApi from './../../api/endpoints/swaggerMockMissingEndpoints';
import { variantsParser } from 'src/parsers/variantsParser'

const useMockApi = () => mockApi;

const Test = () => {
    const { getVariants } = useMockApi();

    React.useEffect( () => {
        getVariants("base", "ILX_....").then(data => { 
            const parsedData = variantsParser(data)
            console.log("Parsed retrieved variants : ", parsedData)
        });
    }, [])

    render ();
};
```

- Sample Return
```
[
    {
        "id": "http://uri.interlex.org/base/ilx_0101431",
        "hasIlxId": "http://uri.interlex.org/base/ilx_0101431",
        "hasIlxPreferredId": "http://uri.interlex.org/base/ilx_0101431",
        "type": "owl:Ontology",
        "versionIRI": "http://uri.interlex.org/base/ontologies/ilx_0101431/version/1717611398/ilx_0101431",
        "versionInfo": "2024-06-05T18:16:38,089335Z",
        "description": "The part of the central nervous system contained within the cranium, comprising the forebrain, midbrain, hindbrain, and metencephalon. It is derived from the anterior part of the embryonic neural tube (or the encephalon). Does not include retina. (CUMBO)The rostral topographic division of the cerebrospinal axis, while the caudal division is the spinal cord. The usual criterion for distinguishing the two divisions in the adult is that the vertebrate brain lies within the skull whereas the spinal cord lies within the spinal (vertebral) column, although this is a difficult problem. (Swanson, 2014)",
        "synonym": [],
        "existingID": [
            "http://uri.neuinfo.org/nif/nifstd/birnlex_796",
            "http://purl.org/sig/ont/fma/fma50801",
            "http://purl.obolibrary.org/obo/UBERON_0000955"
        ],
        "label": "Brain",
        "organization": "My Organization",
        "status": "Active",
        "originatingUser": "userId",
        "editingUser": "userId",
        "subClassOf": "http://uri.interlex.org/base/ilx_0108124"
    },
    {
        "id": "http://uri.interlex.org/base/ilx_0105177",
        "hasIlxId": "http://uri.interlex.org/base/ilx_0105177",
        "hasIlxPreferredId": "http://uri.interlex.org/base/ilx_0105177",
        "type": "owl:Ontology",
        "versionIRI": "http://uri.interlex.org/base/ontologies/ilx_0105177/version/1717612168/ilx_0105177",
        "versionInfo": "2024-06-05T18:29:28,829272Z",
        "description": "Ventral part of the diencephalon extending from the region of the optic chiasm to the caudal border of the mammillary bodies and forming the inferior and lateral walls of the third ventricle.The ventral topographic division of the interbrain. The first adequate description of the hypothalamus as a layer of gray matter surrounding the lower half of the third ventricle (Galen, c173) was provided by Wharton (1656, see 1966 translation, p. 170). His (1893, pp. 159-162) introduced the term but assigned the preoptic region (Swanson, 1976, pp. 229-235) of the hypothalamus to the telencephalon (His, 1893b). The definition here was introduced for vertebrates by Kuhlenbeck (1927, p. 67, Ch. 9).",
        "synonym": [],
        "existingID": [
            "http://purl.org/sig/ont/fma/fma62008",
            "http://uri.neuinfo.org/nif/nifstd/birnlex_734",
            "http://purl.obolibrary.org/obo/UBERON_0001898"
        ],
        "label": "Hypothalamus",
        "organization": "My Organization 2",
        "status": "Inactive",
        "originatingUser": "userId",
        "editingUser": "userId",
        "subClassOf": "http://uri.interlex.org/base/ilx_0109835"
    }
]
```

### Retrieving Versions
- Sample Code
```
import * as mockApi from './../../api/endpoints/swaggerMockMissingEndpoints';
import { versionsParser } from 'src/parsers/versionsParser'

const useMockApi = () => mockApi;

const Test = () => {
    const { getCuries } = useMockApi();

    React.useEffect( () => {
        getVersions("base", "ILX_....").then(data => { 
            const parsedData = versionsParser(data)
            console.log("Parsed retrieved versions : ", parsedData)
        });
    }, [])

    render ();
};
```

- Sample Return
```
[
    {
        "fork": "ForkPB-1",
        "action": "suggested",
        "lastModifyBy": "2024-06-05T18:29:28,829272Z"
    },
    {
        "fork": "ForkPB-2",
        "action": "requested",
        "lastModifyBy": "2024-06-05T18:29:28,829272Z"
    },
    {
        "fork": "ForkPB-3",
        "action": "created",
        "lastModifyBy": "2024-06-05T18:29:28,829272Z"
    },
    {
        "fork": "ForkPB-4",
        "action": "merged",
        "lastModifyBy": "2024-06-05T18:29:28,829272Z"
    }
]
```

### Retrieving Raw Data
- Sample Code
```
import * as mockApi from './../../api/endpoints/interLexURIStructureAPI';

const useMockApi = () => mockApi;

const Test = () => {
    const { getEndpointsIlxGet } = useMockApi();

    React.useEffect( () => {
        getEndpointsIlxGet("base", "ILX_....", "json").then(data => { 
            console.log("Raw Data : ", data)
        });
    }, [])

    render ();
};
```

- Sample Return
```
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
}
```
