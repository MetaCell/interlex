# Interlex API Docs

This template provides instructions on how to use the API.

- [API - Search for Terms](https://github.com/MetaCell/interlex/tree/feature/ILEX-31/src/api#searching-for-terms)
- [API - Get Curies](https://github.com/MetaCell/interlex/tree/feature/ILEX-31/src/api#retrieving-curies)
- [API - Get Single Term](https://github.com/MetaCell/interlex/tree/feature/ILEX-31/src/api#retrieving-single-term)
- [API - Get Variants](https://github.com/MetaCell/interlex/tree/feature/ILEX-31/src/api#retrieving-variants)
- [API - Get Versions](https://github.com/MetaCell/interlex/tree/feature/ILEX-31/src/api#retrieving-versions)


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
        getMatchTerms("b").then(data => { 
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
        "subClassOf": "http://uri.interlex.org/base/ilx_0108124"
    },
    {
        "id": "http://purl.obolibrary.org/obo/UBERON_0001869",
        "type": "owl:Class",
        "description": "Gross division of the brain.  The term cerebrum has several definitions ranging in generality from equivalence to the term \"brain\" to the sum of the left cerebral hemisphere and right hemisphere, to a composite structure consisting of the cerebral cortex and adjacent cerebral white matter. A thorough discussion of the nature and history of the different definitions is presented in Anthoney-94 (NeuroNames).",
        "synonym": [],
        "existingID": [
            "http://purl.org/sig/ont/fma/fma61817",
            "http://uri.neuinfo.org/nif/nifstd/birnlex_1042",
            "http://purl.obolibrary.org/obo/UBERON_0001869"
        ],
        "label": "Cerebrum",
        "subClassOf": "http://uri.interlex.org/base/ilx_0109835",
        "hasIlxId": "http://uri.interlex.org/base/ilx_0102003",
        "hasIlxPreferredId": "http://uri.interlex.org/base/ilx_0102003",
        "versionIRI": "http://uri.interlex.org/base/ontologies/ilx_0102003/version/1717612275/ilx_0102003",
        "versionInfo": "2024-06-05T18:31:15,869120Z"
    },
    {
        "id": "http://uri.interlex.org/base/ilx_0101999",
        "hasIlxId": "http://uri.interlex.org/base/ilx_0101999",
        "hasIlxPreferredId": "http://uri.interlex.org/base/ilx_0101999",
        "type": "owl:Class",
        "description": "The hollow tubular division of the nervous system that lies in the median plane, dorsal to a notochord and flanked by a bilateral series of segmental muscles.It is the topographic division that corresponds to the vertebrate central nervous system.",
        "synonym": "CSA",
        "existingID": "http://uri.neuinfo.org/nif/nifstd/nlx_158477",
        "label": "Cerebrospinal axis",
        "subClassOf": "http://uri.interlex.org/base/ilx_0109835",
        "versionIRI": "http://uri.interlex.org/base/ontologies/ilx_0101999/version/1717612416/ilx_0101999",
        "versionInfo": "2024-06-05T18:33:36,655319Z"
    }
]
```

### Retrieving Single Term
- Sample Code
```
import * as mockApi from './../../api/endpoints/swaggerMockMissingEndpoints';
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
        "label": "Brain",
        "subClassOf": "http://uri.interlex.org/base/ilx_0108124",
        "predicates": {
            "http://uri.interlex.org/base/readable/synonym": [
                {
                    "subject": {
                        "id": "http://uri.interlex.org/base/ilx_0101431"
                    },
                    "predicate": "http://uri.interlex.org/base/readable/synonym",
                    "object": {
                        "id": "Encephalon"
                    }
                },
                {
                    "subject": {
                        "id": "http://uri.interlex.org/base/ilx_0101431"
                    },
                    "predicate": "http://uri.interlex.org/base/readable/synonym",
                    "object": {
                        "id": "synganglion"
                    }
                },
                {
                    "subject": {
                        "id": "http://uri.interlex.org/base/ilx_0101431"
                    },
                    "predicate": "http://uri.interlex.org/base/readable/synonym",
                    "object": {
                        "id": "the brain"
                    }
                },
                {
                    "subject": {
                        "id": "http://uri.interlex.org/base/ilx_0101431"
                    },
                    "predicate": "http://uri.interlex.org/base/readable/synonym",
                    "object": {
                        "id": "suprasegmental levels of nervous system"
                    }
                },
                {
                    "subject": {
                        "id": "http://uri.interlex.org/base/ilx_0101431"
                    },
                    "predicate": "http://uri.interlex.org/base/readable/synonym",
                    "object": {
                        "id": "suprasegmental structures"
                    }
                }
            ],
            "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId": [
                {
                    "subject": {
                        "id": "http://uri.interlex.org/base/ilx_0101431"
                    },
                    "predicate": "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId",
                    "object": {
                        "id": "http://uri.neuinfo.org/nif/nifstd/birnlex_796"
                    }
                },
                {
                    "subject": {
                        "id": "http://uri.interlex.org/base/ilx_0101431"
                    },
                    "predicate": "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId",
                    "object": {
                        "id": "http://purl.org/sig/ont/fma/fma50801"
                    }
                },
                {
                    "subject": {
                        "id": "http://uri.interlex.org/base/ilx_0101431"
                    },
                    "predicate": "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId",
                    "object": {
                        "id": "http://purl.obolibrary.org/obo/UBERON_0000955"
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
                    "object": "http://uri.interlex.org/base/ilx_0108124"
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
