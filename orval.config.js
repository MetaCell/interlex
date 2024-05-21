module.exports = {
  uri: {
    input: {
      target: "https://uri.olympiangods.org/docs/swagger.json",
      validation: false,
    },
    output: {
      mode: "split",
      target: "./src/api/endpoints",
      schemas: "./src/api/model",
      baseUrl: 'https://uri.olympiangods.org/',
      mock: true,
      override: {
        mutator: {
          path: './src/api/mutator/custom-client.ts',
          name: 'customInstance',
        },
        operations: {
          /** TODO : Endpoint returns a 500, it's being reused by multiple endpoints.
           * In our use case, we need this operation to ADD Ontologies with or
           * without paths.
           * */
          get_ontologies_ontologies: {
            mock: {
              data: () => ({
                status_code: 200,
                message: "",
              }),
            },
          },
          // Override existing endpoint, return mock data for fragment ID ilx_0101431
          get_endpoints_ilx: {
            mock: {
              data: () => ({
                name : "ilx_0101431",
                description : "ilx_0101431",
                prefixes: {
                  owl: "http://www.w3.org/2002/07/owl#",
                  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
                  xsd: "http://www.w3.org/2001/XMLSchema#",
                  xml: "http://www.w3.org/XML/1998/namespace",
                  "": "file:///ERROR/EMPTY/PREFIX/BANNED/",
                },
                triples: [
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "suprasegmental levels of nervous system",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "synganglion",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "suprasegmental structures",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://uri.neuinfo.org/nif/nifstd/birnlex_796>",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "<http://uri.interlex.org/base/ilx_0112784>",
                    "<http://uri.interlex.org/base/ilx_0102661>",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "<http://uri.interlex.org/base/ilx_0112796>",
                    "<http://uri.interlex.org/base/ilx_0101901>",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "<http://purl.obolibrary.org/obo/IAO_0000115>",
                    "The part of the central nervous system contained within the cranium, comprising the forebrain, midbrain, hindbrain, and metencephalon. It is derived from the anterior part of the embryonic neural tube (or the encephalon). Does not include retina. (CUMBO)The rostral topographic division of the cerebrospinal axis, while the caudal division is the spinal cord. The usual criterion for distinguishing the two divisions in the adult is that the vertebrate brain lies within the skull whereas the spinal cord lies within the spinal (vertebral) column, although this is a difficult problem. (Swanson, 2014)",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://purl.org/sig/ont/fma/fma50801>",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "the brain",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "<http://uri.interlex.org/base/ilx_0112785>",
                    "<http://uri.interlex.org/base/ilx_0101999>",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "rdfs:subClassOf",
                    "<http://uri.interlex.org/base/ilx_0108124>",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Encephalon",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "rdfs:label",
                    "Brain",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://purl.obolibrary.org/obo/UBERON_0000955>",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "rdf:type",
                    "owl:Class",
                  ],
                ],
              }),
            },
          },
        },
        allParamsOptional: true,
        urlEncodeParameters: true,
      },
    },
  },
  interlex: {
    input: {
      target: "./interlex.yaml",
    },
    output: {
      mode: "split",
      target: "./src/api/endpoints",
      schemas: "./src/api/model",
      baseUrl: 'http://localhost:3200/',
      mock: true,
      override: {
        mutator: {
          path: './src/api/mutator/custom-client.ts',
          name: 'customInstance',
        },
        operations: {
          login: {
            mock: {
              data: () => ({
                status: 200,
                token: "",
                username: ""
              }),
            },
          },
          logout: {
            mock: {
              data: () => ({
                status: 200,
                token: "",
                username: ""
              }),
            },
          },
          register: {
            mock: {
              data: () => ({
                status: 200,
                token: "",
                username: ""
              }),
            },
          },
          new_organization: {
            mock: {
              data: () => ({
                status: 200,
                token: "",
                name: ""
              }),
            },
          },
          get_organization: {
            mock: {
              data: () => ({
                name: "SPARC Anatomical Working Group",
                description : "The Stimulating Peripheral Activity to Relieve Conditions (SPARC) effort is the result of National Institutes of Health’s (NIH) drive to map out the neural circuitry responsible for visceral control in higher vertebrates. The SPARC Anatomy Working Group (SAWG) is responsible for the integrity of anatomical knowledge in SPARC. In particular, it provides the relevant guidance and expertise about: Defining and naming anatomical terms, Maintaining ontologies of anatomical knowledge, Compiling and curating computable knowledge about multiscale routes pathways",
                creation_date: "01/01/2000",
                status: 200,
                message: "",
                id: "ilx_0101431",
                url: "sparc.science",
                author : "SPARC",
                terms : [{
                  name : "Brain",
                  description : "The part of the central nervous system contained within the cranium, comprising the forebrain, midbrain, hindbrain, and metencephalon.",
                  id : "ilx_0101431",
                  prefixes: {
                    owl: "http://www.w3.org/2002/07/owl#",
                    rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                    rdfs: "http://www.w3.org/2000/01/rdf-schema#",
                    xsd: "http://www.w3.org/2001/XMLSchema#",
                    xml: "http://www.w3.org/XML/1998/namespace",
                    "": "file:///ERROR/EMPTY/PREFIX/BANNED/",
                  },
                  triples: [
                    [
                      "<http://uri.interlex.org/base/ilx_0101431>",
                      "<http://uri.interlex.org/base/readable/synonym>",
                      "suprasegmental levels of nervous system",
                    ],
                    [
                      "<http://uri.interlex.org/base/ilx_0101431>",
                      "<http://uri.interlex.org/base/readable/synonym>",
                      "synganglion",
                    ],
                    [
                      "<http://uri.interlex.org/base/ilx_0101431>",
                      "<http://uri.interlex.org/base/readable/synonym>",
                      "suprasegmental structures",
                    ],
                    [
                      "<http://uri.interlex.org/base/ilx_0101431>",
                      "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                      "<http://uri.neuinfo.org/nif/nifstd/birnlex_796>",
                    ],
                    [
                      "<http://uri.interlex.org/base/ilx_0101431>",
                      "<http://uri.interlex.org/base/ilx_0112784>",
                      "<http://uri.interlex.org/base/ilx_0102661>",
                    ],
                    [
                      "<http://uri.interlex.org/base/ilx_0101431>",
                      "<http://uri.interlex.org/base/ilx_0112796>",
                      "<http://uri.interlex.org/base/ilx_0101901>",
                    ],
                    [
                      "<http://uri.interlex.org/base/ilx_0101431>",
                      "<http://purl.obolibrary.org/obo/IAO_0000115>",
                      "The part of the central nervous system contained within the cranium, comprising the forebrain, midbrain, hindbrain, and metencephalon. It is derived from the anterior part of the embryonic neural tube (or the encephalon). Does not include retina. (CUMBO)The rostral topographic division of the cerebrospinal axis, while the caudal division is the spinal cord. The usual criterion for distinguishing the two divisions in the adult is that the vertebrate brain lies within the skull whereas the spinal cord lies within the spinal (vertebral) column, although this is a difficult problem. (Swanson, 2014)",
                    ],
                    [
                      "<http://uri.interlex.org/base/ilx_0101431>",
                      "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                      "<http://purl.org/sig/ont/fma/fma50801>",
                    ],
                    [
                      "<http://uri.interlex.org/base/ilx_0101431>",
                      "<http://uri.interlex.org/base/readable/synonym>",
                      "the brain",
                    ],
                    [
                      "<http://uri.interlex.org/base/ilx_0101431>",
                      "<http://uri.interlex.org/base/ilx_0112785>",
                      "<http://uri.interlex.org/base/ilx_0101999>",
                    ],
                    [
                      "<http://uri.interlex.org/base/ilx_0101431>",
                      "rdfs:subClassOf",
                      "<http://uri.interlex.org/base/ilx_0108124>",
                    ],
                    [
                      "<http://uri.interlex.org/base/ilx_0101431>",
                      "<http://uri.interlex.org/base/readable/synonym>",
                      "Encephalon",
                    ],
                    [
                      "<http://uri.interlex.org/base/ilx_0101431>",
                      "rdfs:label",
                      "Brain",
                    ],
                    [
                      "<http://uri.interlex.org/base/ilx_0101431>",
                      "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                      "<http://purl.obolibrary.org/obo/UBERON_0000955>",
                    ],
                    [
                      "<http://uri.interlex.org/base/ilx_0101431>",
                      "rdf:type",
                      "owl:Class",
                    ],
                  ],
                },
                {
                  name : "Right vagus nerve",
                  description : "Right vagus nerve",
                  id : "ilx_0789705",
                  prefixes: {
                    "owl": "http://www.w3.org/2002/07/owl#",
                    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
                    "xsd": "http://www.w3.org/2001/XMLSchema#",
                    "xml": "http://www.w3.org/XML/1998/namespace",
                    "": "file:///ERROR/EMPTY/PREFIX/BANNED/"
                  },
                  triples: [
                    [
                      "<http://uri.interlex.org/base/ilx_0789705>",
                      "<http://uri.interlex.org/base/ilx_0738400>",
                      "<http://uri.interlex.org/base/ilx_0793922>"
                    ],
                    [
                      "<http://uri.interlex.org/base/ilx_0789705>",
                      "<http://uri.interlex.org/base/readable/synonym>",
                      "Right vagus"
                    ],
                    [
                      "<http://uri.interlex.org/base/ilx_0789705>",
                      "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                      "<http://purl.org/sig/ont/fma/fma6219>"
                    ],
                    [
                      "<http://uri.interlex.org/base/ilx_0789705>",
                      "rdfs:label",
                      "Right vagus nerve"
                    ],
                    [
                      "<http://uri.interlex.org/base/ilx_0789705>",
                      "<http://uri.interlex.org/base/readable/synonym>",
                      "Right vagus nerve tree"
                    ],
                    [
                      "<http://uri.interlex.org/base/ilx_0789705>",
                      "rdf:type",
                      "owl:Class"
                    ]
                  ]
                }]
                
              }),
            },
          },
          get_organizations: {
            mock: {
              data: () => [
                {
                  name: "SPARC Anatomical Working Group",
                  description : "The Stimulating Peripheral Activity to Relieve Conditions (SPARC) effort is the result of National Institutes of Health’s (NIH) drive to map out the neural circuitry responsible for visceral control in higher vertebrates. The SPARC Anatomy Working Group (SAWG) is responsible for the integrity of anatomical knowledge in SPARC. In particular, it provides the relevant guidance and expertise about: Defining and naming anatomical terms, Maintaining ontologies of anatomical knowledge, Compiling and curating computable knowledge about multiscale routes pathways",
                  creation_date: "01/01/2000",
                  status: 200,
                  message: "",
                  id: "ilx_0101431",
                  url: "sparc.science",
                  author : "SPARC",
                  terms : [{
                    name : "Brain",
                    description : "The part of the central nervous system contained within the cranium, comprising the forebrain, midbrain, hindbrain, and metencephalon.",
                    id : "ilx_0101431",
                    prefixes: {
                      owl: "http://www.w3.org/2002/07/owl#",
                      rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                      rdfs: "http://www.w3.org/2000/01/rdf-schema#",
                      xsd: "http://www.w3.org/2001/XMLSchema#",
                      xml: "http://www.w3.org/XML/1998/namespace",
                      "": "file:///ERROR/EMPTY/PREFIX/BANNED/",
                    },
                    triples: [
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/base/readable/synonym>",
                        "suprasegmental levels of nervous system",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/base/readable/synonym>",
                        "synganglion",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/base/readable/synonym>",
                        "suprasegmental structures",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                        "<http://uri.neuinfo.org/nif/nifstd/birnlex_796>",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/base/ilx_0112784>",
                        "<http://uri.interlex.org/base/ilx_0102661>",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/base/ilx_0112796>",
                        "<http://uri.interlex.org/base/ilx_0101901>",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://purl.obolibrary.org/obo/IAO_0000115>",
                        "The part of the central nervous system contained within the cranium, comprising the forebrain, midbrain, hindbrain, and metencephalon. It is derived from the anterior part of the embryonic neural tube (or the encephalon). Does not include retina. (CUMBO)The rostral topographic division of the cerebrospinal axis, while the caudal division is the spinal cord. The usual criterion for distinguishing the two divisions in the adult is that the vertebrate brain lies within the skull whereas the spinal cord lies within the spinal (vertebral) column, although this is a difficult problem. (Swanson, 2014)",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                        "<http://purl.org/sig/ont/fma/fma50801>",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/base/readable/synonym>",
                        "the brain",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/base/ilx_0112785>",
                        "<http://uri.interlex.org/base/ilx_0101999>",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "rdfs:subClassOf",
                        "<http://uri.interlex.org/base/ilx_0108124>",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/base/readable/synonym>",
                        "Encephalon",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "rdfs:label",
                        "Brain",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                        "<http://purl.obolibrary.org/obo/UBERON_0000955>",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "rdf:type",
                        "owl:Class",
                      ],
                    ],
                  },
                  {
                    name : "Right vagus nerve",
                    description : "Right vagus nerve",
                    id : "ilx_0789705",
                    prefixes: {
                      "owl": "http://www.w3.org/2002/07/owl#",
                      "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                      "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
                      "xsd": "http://www.w3.org/2001/XMLSchema#",
                      "xml": "http://www.w3.org/XML/1998/namespace",
                      "": "file:///ERROR/EMPTY/PREFIX/BANNED/"
                    },
                    triples: [
                      [
                        "<http://uri.interlex.org/base/ilx_0789705>",
                        "<http://uri.interlex.org/base/ilx_0738400>",
                        "<http://uri.interlex.org/base/ilx_0793922>"
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0789705>",
                        "<http://uri.interlex.org/base/readable/synonym>",
                        "Right vagus"
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0789705>",
                        "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                        "<http://purl.org/sig/ont/fma/fma6219>"
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0789705>",
                        "rdfs:label",
                        "Right vagus nerve"
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0789705>",
                        "<http://uri.interlex.org/base/readable/synonym>",
                        "Right vagus nerve tree"
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0789705>",
                        "rdf:type",
                        "owl:Class"
                      ]
                    ]
                  }]
                  
                },
                {
                  name: "SPARC Anatomical Working Group",
                  description : "The Stimulating Peripheral Activity to Relieve Conditions (SPARC) effort is the result of National Institutes of Health’s (NIH) drive to map out the neural circuitry responsible for visceral control in higher vertebrates. The SPARC Anatomy Working Group (SAWG) is responsible for the integrity of anatomical knowledge in SPARC. In particular, it provides the relevant guidance and expertise about: Defining and naming anatomical terms, Maintaining ontologies of anatomical knowledge, Compiling and curating computable knowledge about multiscale routes pathways",
                  creation_date: "21/11/2020",
                  status: 200,
                  message: "",
                  id: "ilx_0101431",
                  url: "sparc.science",
                  author : "SPARC",
                  terms : [{
                    name : "Brain",
                    description : "The part of the central nervous system contained within the cranium, comprising the forebrain, midbrain, hindbrain, and metencephalon.",
                    id : "ilx_0101431",
                    prefixes: {
                      owl: "http://www.w3.org/2002/07/owl#",
                      rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                      rdfs: "http://www.w3.org/2000/01/rdf-schema#",
                      xsd: "http://www.w3.org/2001/XMLSchema#",
                      xml: "http://www.w3.org/XML/1998/namespace",
                      "": "file:///ERROR/EMPTY/PREFIX/BANNED/",
                    },
                    triples: [
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/base/readable/synonym>",
                        "suprasegmental levels of nervous system",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/base/readable/synonym>",
                        "synganglion",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/base/readable/synonym>",
                        "suprasegmental structures",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                        "<http://uri.neuinfo.org/nif/nifstd/birnlex_796>",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/base/ilx_0112784>",
                        "<http://uri.interlex.org/base/ilx_0102661>",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/base/ilx_0112796>",
                        "<http://uri.interlex.org/base/ilx_0101901>",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://purl.obolibrary.org/obo/IAO_0000115>",
                        "The part of the central nervous system contained within the cranium, comprising the forebrain, midbrain, hindbrain, and metencephalon. It is derived from the anterior part of the embryonic neural tube (or the encephalon). Does not include retina. (CUMBO)The rostral topographic division of the cerebrospinal axis, while the caudal division is the spinal cord. The usual criterion for distinguishing the two divisions in the adult is that the vertebrate brain lies within the skull whereas the spinal cord lies within the spinal (vertebral) column, although this is a difficult problem. (Swanson, 2014)",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                        "<http://purl.org/sig/ont/fma/fma50801>",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/base/readable/synonym>",
                        "the brain",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/base/ilx_0112785>",
                        "<http://uri.interlex.org/base/ilx_0101999>",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "rdfs:subClassOf",
                        "<http://uri.interlex.org/base/ilx_0108124>",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/base/readable/synonym>",
                        "Encephalon",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "rdfs:label",
                        "Brain",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                        "<http://purl.obolibrary.org/obo/UBERON_0000955>",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "rdf:type",
                        "owl:Class",
                      ],
                    ],
                  },
                  {
                    name : "Right vagus nerve",
                    description : "Right vagus nerve",
                    id : "ilx_0789705",
                    prefixes: {
                      "owl": "http://www.w3.org/2002/07/owl#",
                      "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                      "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
                      "xsd": "http://www.w3.org/2001/XMLSchema#",
                      "xml": "http://www.w3.org/XML/1998/namespace",
                      "": "file:///ERROR/EMPTY/PREFIX/BANNED/"
                    },
                    triples: [
                      [
                        "<http://uri.interlex.org/base/ilx_0789705>",
                        "<http://uri.interlex.org/base/ilx_0738400>",
                        "<http://uri.interlex.org/base/ilx_0793922>"
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0789705>",
                        "<http://uri.interlex.org/base/readable/synonym>",
                        "Right vagus"
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0789705>",
                        "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                        "<http://purl.org/sig/ont/fma/fma6219>"
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0789705>",
                        "rdfs:label",
                        "Right vagus nerve"
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0789705>",
                        "<http://uri.interlex.org/base/readable/synonym>",
                        "Right vagus nerve tree"
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0789705>",
                        "rdf:type",
                        "owl:Class"
                      ]
                    ]
                  }]
                },
                {
                  name: "SPARC Anatomical Working Group",
                  description : "The Stimulating Peripheral Activity to Relieve Conditions (SPARC) effort is the result of National Institutes of Health’s (NIH) drive to map out the neural circuitry responsible for visceral control in higher vertebrates. The SPARC Anatomy Working Group (SAWG) is responsible for the integrity of anatomical knowledge in SPARC. In particular, it provides the relevant guidance and expertise about: Defining and naming anatomical terms, Maintaining ontologies of anatomical knowledge, Compiling and curating computable knowledge about multiscale routes pathways",
                  creation_date: "08/06/2024",
                  status: 200,
                  message: "",
                  id: "ilx_0101431",
                  url: "sparc.science",
                  author : "SPARC",
                  terms : [{
                    name : "Brain",
                    description : "The part of the central nervous system contained within the cranium, comprising the forebrain, midbrain, hindbrain, and metencephalon.",
                    id : "ilx_0101431",
                    prefixes: {
                      owl: "http://www.w3.org/2002/07/owl#",
                      rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                      rdfs: "http://www.w3.org/2000/01/rdf-schema#",
                      xsd: "http://www.w3.org/2001/XMLSchema#",
                      xml: "http://www.w3.org/XML/1998/namespace",
                      "": "file:///ERROR/EMPTY/PREFIX/BANNED/",
                    },
                    triples: [
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/base/readable/synonym>",
                        "suprasegmental levels of nervous system",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/base/readable/synonym>",
                        "synganglion",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/base/readable/synonym>",
                        "suprasegmental structures",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                        "<http://uri.neuinfo.org/nif/nifstd/birnlex_796>",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/base/ilx_0112784>",
                        "<http://uri.interlex.org/base/ilx_0102661>",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/base/ilx_0112796>",
                        "<http://uri.interlex.org/base/ilx_0101901>",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://purl.obolibrary.org/obo/IAO_0000115>",
                        "The part of the central nervous system contained within the cranium, comprising the forebrain, midbrain, hindbrain, and metencephalon. It is derived from the anterior part of the embryonic neural tube (or the encephalon). Does not include retina. (CUMBO)The rostral topographic division of the cerebrospinal axis, while the caudal division is the spinal cord. The usual criterion for distinguishing the two divisions in the adult is that the vertebrate brain lies within the skull whereas the spinal cord lies within the spinal (vertebral) column, although this is a difficult problem. (Swanson, 2014)",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                        "<http://purl.org/sig/ont/fma/fma50801>",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/base/readable/synonym>",
                        "the brain",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/base/ilx_0112785>",
                        "<http://uri.interlex.org/base/ilx_0101999>",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "rdfs:subClassOf",
                        "<http://uri.interlex.org/base/ilx_0108124>",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/base/readable/synonym>",
                        "Encephalon",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "rdfs:label",
                        "Brain",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                        "<http://purl.obolibrary.org/obo/UBERON_0000955>",
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0101431>",
                        "rdf:type",
                        "owl:Class",
                      ],
                    ],
                  },
                  {
                    name : "Right vagus nerve",
                    description : "Right vagus nerve",
                    id : "ilx_0789705",
                    prefixes: {
                      "owl": "http://www.w3.org/2002/07/owl#",
                      "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                      "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
                      "xsd": "http://www.w3.org/2001/XMLSchema#",
                      "xml": "http://www.w3.org/XML/1998/namespace",
                      "": "file:///ERROR/EMPTY/PREFIX/BANNED/"
                    },
                    triples: [
                      [
                        "<http://uri.interlex.org/base/ilx_0789705>",
                        "<http://uri.interlex.org/base/ilx_0738400>",
                        "<http://uri.interlex.org/base/ilx_0793922>"
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0789705>",
                        "<http://uri.interlex.org/base/readable/synonym>",
                        "Right vagus"
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0789705>",
                        "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                        "<http://purl.org/sig/ont/fma/fma6219>"
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0789705>",
                        "rdfs:label",
                        "Right vagus nerve"
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0789705>",
                        "<http://uri.interlex.org/base/readable/synonym>",
                        "Right vagus nerve tree"
                      ],
                      [
                        "<http://uri.interlex.org/base/ilx_0789705>",
                        "rdf:type",
                        "owl:Class"
                      ]
                    ]
                  }]
                }
              ],
            },
          },
          // Search for specific 'term' and get all results
          get_match_terms: {
            mock: {
              data: () => [{
                name : "Brain",
                description : "The part of the central nervous system contained within the cranium, comprising the forebrain, midbrain, hindbrain, and metencephalon.",
                id : "ilx_0101431",
                prefixes: {
                  owl: "http://www.w3.org/2002/07/owl#",
                  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
                  xsd: "http://www.w3.org/2001/XMLSchema#",
                  xml: "http://www.w3.org/XML/1998/namespace",
                  "": "file:///ERROR/EMPTY/PREFIX/BANNED/",
                },
                triples: [
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "suprasegmental levels of nervous system",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "synganglion",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "suprasegmental structures",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://uri.neuinfo.org/nif/nifstd/birnlex_796>",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "<http://uri.interlex.org/base/ilx_0112784>",
                    "<http://uri.interlex.org/base/ilx_0102661>",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "<http://uri.interlex.org/base/ilx_0112796>",
                    "<http://uri.interlex.org/base/ilx_0101901>",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "<http://purl.obolibrary.org/obo/IAO_0000115>",
                    "The part of the central nervous system contained within the cranium, comprising the forebrain, midbrain, hindbrain, and metencephalon. It is derived from the anterior part of the embryonic neural tube (or the encephalon). Does not include retina. (CUMBO)The rostral topographic division of the cerebrospinal axis, while the caudal division is the spinal cord. The usual criterion for distinguishing the two divisions in the adult is that the vertebrate brain lies within the skull whereas the spinal cord lies within the spinal (vertebral) column, although this is a difficult problem. (Swanson, 2014)",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://purl.org/sig/ont/fma/fma50801>",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "the brain",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "<http://uri.interlex.org/base/ilx_0112785>",
                    "<http://uri.interlex.org/base/ilx_0101999>",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "rdfs:subClassOf",
                    "<http://uri.interlex.org/base/ilx_0108124>",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Encephalon",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "rdfs:label",
                    "Brain",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://purl.obolibrary.org/obo/UBERON_0000955>",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "rdf:type",
                    "owl:Class",
                  ],
                ],
              },
              {
                name : "Right vagus nerve",
                description : "Right vagus nerve",
                id : "ilx_0789705",
                prefixes: {
                  "owl": "http://www.w3.org/2002/07/owl#",
                  "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                  "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
                  "xsd": "http://www.w3.org/2001/XMLSchema#",
                  "xml": "http://www.w3.org/XML/1998/namespace",
                  "": "file:///ERROR/EMPTY/PREFIX/BANNED/"
                },
                triples: [
                  [
                    "<http://uri.interlex.org/base/ilx_0789705>",
                    "<http://uri.interlex.org/base/ilx_0738400>",
                    "<http://uri.interlex.org/base/ilx_0793922>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0789705>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Right vagus"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0789705>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://purl.org/sig/ont/fma/fma6219>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0789705>",
                    "rdfs:label",
                    "Right vagus nerve"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0789705>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Right vagus nerve tree"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0789705>",
                    "rdf:type",
                    "owl:Class"
                  ]
                ]
              },
              {
                name : "includeForSPARC",
                description : "A relationship that binds a term to the required entities for the purposes required by SPARC",
                id : "ilx_0738400",
                prefixes: {
                  "owl": "http://www.w3.org/2002/07/owl#",
                  "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                  "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
                  "xsd": "http://www.w3.org/2001/XMLSchema#",
                  "xml": "http://www.w3.org/XML/1998/namespace",
                  "": "file:///ERROR/EMPTY/PREFIX/BANNED/"
                },
                triples: [
                  [
                    "<http://uri.interlex.org/base/ilx_0738400>",
                    "<http://purl.obolibrary.org/obo/IAO_0000115>",
                    "A relationship that binds a term to the required entities for the purposes required by SPARC, e.g., returning a term in response to a query for all relevant organ parts when it is not specified in the core ontology.  We view this as a temporary and practical solution.  At some points, all such terms will be contributed back to the core ontologies for proper engineering."
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0738400>",
                    "rdfs:label",
                    "includeForSPARC"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0738400>",
                    "rdf:type",
                    "owl:ObjectProperty"
                  ]
                ]
              },
              {
                name : "Cerebrospinal axis",
                description : "The hollow tubular division of the nervous system that lies in the median plane, dorsal to a notochord and flanked by a bilateral series of segmental muscles.It is the topographic division that corresponds to the vertebrate central nervous system.",
                id : "ilx_0101999",
                prefixes: {
                  "owl": "http://www.w3.org/2002/07/owl#",
                  "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                  "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
                  "xsd": "http://www.w3.org/2001/XMLSchema#",
                  "xml": "http://www.w3.org/XML/1998/namespace",
                  "": "file:///ERROR/EMPTY/PREFIX/BANNED/"
                },
                triples: [
                  [
                    "<http://uri.interlex.org/base/ilx_0101999>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "CSA"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101999>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://uri.neuinfo.org/nif/nifstd/nlx_158477>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101999>",
                    "rdf:type",
                    "owl:Class"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101999>",
                    "<http://uri.interlex.org/base/ilx_0112785>",
                    "<http://uri.interlex.org/base/ilx_0107422>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101999>",
                    "<http://purl.obolibrary.org/obo/IAO_0000115>",
                    "The hollow tubular division of the nervous system that lies in the median plane, dorsal to a notochord and flanked by a bilateral series of segmental muscles.It is the topographic division that corresponds to the vertebrate central nervous system."
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101999>",
                    "rdfs:label",
                    "Cerebrospinal axis"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101999>",
                    "rdfs:subClassOf",
                    "<http://uri.interlex.org/base/ilx_0109835>"
                  ]
                ]
              }],
            },
          },
        },
        /** TODO : New endpoint missing to retrieve hierarchy (relationships)
         * Suggestion, return array of objects, with indexes determining hierarchies.
         * */
        get_hierarchy: {
          mock: {
            data: () => [],
          },
        },
        // TODO : Existing endpoint but missing operation, edits exising fragments
        add_fragment: {
          mock: {
            data: () => ({
              status_code: 200,
              message: "",
            }),
          },
        },
        // TODO : Missing endpoint and missing operation. Different than add_fragment?
        add_term: {
          mock: {
            data: () => ({
              status_code: 200,
              message: "",
            }),
          },
        },
        /** TODO : Missing endpoint and operation.
         * Use case, edit multiple terms at once.
         * */
        bulk_edit_terms: {
          mock: {
            data: () => ({
              status_code: 200,
              message: "",
            }),
          },
        },
        /** TODO : Missing endpoint and operation.
         * Use case, download all ontologies.
         * */
        get_all_ontologies: {
          mock: {
            data: () => [{
              name : "Test Ontology 1",
              description : "This file imports all the bridging modules that are relating NIF-Cell with other NIF  modules",
              id: "nif-neuron-bridge-test1",
              version_info: "0.1; May 9th, 2012",
              url : "http://ontology.neuinfo.org/NIF/ttl/unused/NIF-Neuron-Bridge.ttl"
            },{
              name : "Test Ontology 2",
              description : "This file imports all the bridging modules that are relating NIF-Cell with other NIF  modules",
              id: "nif-neuron-bridge-test2",
              version_info: "0.1; May 9th, 2012",
              url : "http://ontology.neuinfo.org/NIF/ttl/unused/NIF-Neuron-Bridge.ttl"
            },{
              name : "Test Ontology 3",
              description : "This file imports all the bridging modules that are relating NIF-Cell with other NIF  modules",
              id: "nif-neuron-bridge-test3",
              version_info: "0.1; May 9th, 2012",
              url : "http://ontology.neuinfo.org/NIF/ttl/unused/NIF-Neuron-Bridge.ttl"
            },{
              name : "Test Ontology 4",
              description : "This file imports all the bridging modules that are relating NIF-Cell with other NIF  modules",
              id: "nif-neuron-bridge-test4",
              version_info: "0.1; May 9th, 2012",
              url : "http://ontology.neuinfo.org/NIF/ttl/unused/NIF-Neuron-Bridge.ttl"
            },{
              name : "Test Ontology 5",
              description : "This file imports all the bridging modules that are relating NIF-Cell with other NIF  modules",
              id: "nif-neuron-bridge-test5",
              version_info: "0.1; May 9th, 2012",
              url : "http://ontology.neuinfo.org/NIF/ttl/unused/NIF-Neuron-Bridge.ttl"
            }],
          },
        },
        /** TODO : Missing endpoint and operation.
         * Use case, download all ontologies matching a single term
         * */
        get_all_ontologies_matching_term: {
          mock: {
            data: () => [{
              name : "Matching Ontology 1 : NIF-Neuron-Bridge.owl",
              description : "This file imports all the bridging modules that are relating NIF-Cell with other NIF  modules",
              id: "nif-neuron-bridge-1",
              version_info: "0.1; May 9th, 2012",
              url : "http://ontology.neuinfo.org/NIF/ttl/unused/NIF-Neuron-Bridge.ttl"
            },{
              name : "Matching Ontology 2 : NIF-Neuron-Bridge.owl",
              description : "This file imports all the bridging modules that are relating NIF-Cell with other NIF  modules",
              id: "nif-neuron-bridge-2",
              version_info: "0.1; May 9th, 2012",
              url : "http://ontology.neuinfo.org/NIF/ttl/unused/NIF-Neuron-Bridge.ttl"
            },{
              name : "Matching Ontology 3 : NIF-Neuron-Bridge.owl",
              description : "This file imports all the bridging modules that are relating NIF-Cell with other NIF  modules",
              id: "nif-neuron-bridge-3",
              version_info: "0.1; May 9th, 2012",
              url : "http://ontology.neuinfo.org/NIF/ttl/unused/NIF-Neuron-Bridge.ttl"
            }],
          },
        },
      }
    },
  },
};
