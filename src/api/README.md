# Interlex API Docs

This template provides instructions on how to use the API.


- Search 
Sample Code 
```
import * as mockApi from './../../api/endpoints/swaggerMockMissingEndpoints';

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

Sample Search Return
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

- Get Curies

```
import * as mockApi from './../../api/endpoints/swaggerMockMissingEndpoints';

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

Sample Return
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