module.exports = {
  uri: {
    input: {
      target: "https://uri.olympiangods.org/docs/swagger.json",
      validation: false,
    },
    output: {
      mode: "split",
      target: "./src/api/endpoints",
      schemas: "./src/model/backend",
      baseUrl: 'https://uri.olympiangods.org/',
      mock: true,
      override: {
        mutator: {
          path: './src/mutator/customClient.ts',
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
      schemas: "./src/model/backend",
      baseUrl: 'http://localhost:3200/',
      mock: true,
      override: {
        mutator: {
          path: './src/mutator/customClient.ts',
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
                    [
                      "<http://uri.interlex.org/base/ilx_0101431>",
                      "score",
                      "216.32",
                    ],
                    [
                      "<http://uri.interlex.org/base/ilx_0101431>",
                      "version",
                      "18",
                    ],
                    [
                      "<http://uri.interlex.org/base/ilx_0101431>",
                      "owlEquivalent",
                      "owl:Class",
                    ],
                    [
                      "<http://uri.interlex.org/base/ilx_0101431>",
                      "lastModify",
                      "2022-04-30",
                    ],
                    [
                      "<http://uri.interlex.org/base/ilx_0101431>",
                      "lastModifyBy",
                      "Neurolex",
                    ],
                    [
                      "<http://uri.interlex.org/base/ilx_0101431>",
                      "submittedBy",
                      "First User",
                    ],
                    [
                      "<http://uri.interlex.org/base/ilx_0101431>",
                      "preferredId",
                      "Neurolex Preferred ID",
                    ],
                    [
                      "<http://uri.interlex.org/base/ilx_0101431>",
                      "organization",
                      "First Organization",
                    ]
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
                  id: "ilx_0101431",
                  terms : [{
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
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "score",
                    "216.32",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "version",
                    "18",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "owlEquivalent",
                    "owl:Class",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "lastModify",
                    "2022-04-30",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "lastModifyBy",
                    "Neurolex",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "submittedBy",
                    "First User",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "preferredId",
                    "Neurolex Preferred ID",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "organization",
                    "First Organization",
                  ]
                ]
              },
              {
                "id" : "ilx_0105177",
                "prefixes": {
                  "owl": "http://www.w3.org/2002/07/owl#",
                  "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                  "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
                  "xsd": "http://www.w3.org/2001/XMLSchema#",
                  "xml": "http://www.w3.org/XML/1998/namespace",
                  "": "file:///ERROR/EMPTY/PREFIX/BANNED/"
                },
                "triples": [
                  [
                    "<http://uri.interlex.org/base/ilx_0105177>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Preoptico-hypothalamic region"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0105177>",
                    "rdfs:subClassOf",
                    "<http://uri.interlex.org/base/ilx_0109835>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0105177>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Hypencephalon"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0105177>",
                    "rdf:type",
                    "owl:Class"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0105177>",
                    "<http://uri.interlex.org/base/ilx_0112785>",
                    "<http://uri.interlex.org/base/ilx_0103217>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0105177>",
                    "rdfs:label",
                    "Hypothalamus"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0105177>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://purl.org/sig/ont/fma/fma62008>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0105177>",
                    "<http://purl.obolibrary.org/obo/IAO_0000115>",
                    "Ventral part of the diencephalon extending from the region of the optic chiasm to the caudal border of the mammillary bodies and forming the inferior and lateral walls of the third ventricle.The ventral topographic division of the interbrain. The first adequate description of the hypothalamus as a layer of gray matter surrounding the lower half of the third ventricle (Galen, c173) was provided by Wharton (1656, see 1966 translation, p. 170). His (1893, pp. 159-162) introduced the term but assigned the preoptic region (Swanson, 1976, pp. 229-235) of the hypothalamus to the telencephalon (His, 1893b). The definition here was introduced for vertebrates by Kuhlenbeck (1927, p. 67, Ch. 9)."
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0105177>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "hypothalamus"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0105177>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://uri.neuinfo.org/nif/nifstd/birnlex_734>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0105177>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Hy"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0105177>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://purl.obolibrary.org/obo/UBERON_0001898>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0105177>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Preoptico-hypothalamic area"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "score",
                    "216.32",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "version",
                    "18",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "owlEquivalent",
                    "owl:Class",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "lastModify",
                    "2022-04-30",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "lastModifyBy",
                    "Neurolex",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "submittedBy",
                    "First User",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "preferredId",
                    "Neurolex Preferred ID",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "organization",
                    "First Organization",
                  ]
                ]
              },
              {
                "id" : "ilx_0103217",
                "prefixes": {
                  "owl": "http://www.w3.org/2002/07/owl#",
                  "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                  "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
                  "xsd": "http://www.w3.org/2001/XMLSchema#",
                  "xml": "http://www.w3.org/XML/1998/namespace",
                  "": "file:///ERROR/EMPTY/PREFIX/BANNED/"
                },
                "triples": [
                  [
                    "<http://uri.interlex.org/base/ilx_0103217>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://purl.obolibrary.org/obo/UBERON_0001894>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0103217>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "DiE"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0103217>",
                    "<http://uri.interlex.org/base/ilx_0112785>",
                    "<http://uri.interlex.org/base/ilx_0104355>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0103217>",
                    "rdf:type",
                    "owl:Class"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0103217>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "betweenbrain"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0103217>",
                    "<http://purl.obolibrary.org/obo/IAO_0000115>",
                    "Part of the brain consisting of the paired caudal parts of the prosencephalon from which the Thalamus; Hypothalamus; Epithalamus; and Subthalamus are derived.(MeSH)"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0103217>",
                    "rdfs:label",
                    "Diencephalon"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0103217>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Mature diencephalon"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0103217>",
                    "<http://uri.interlex.org/base/ilx_0112784>",
                    "<http://uri.interlex.org/base/ilx_0109024>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0103217>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://uri.neuinfo.org/nif/nifstd/birnlex_1503>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0103217>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://purl.org/sig/ont/fma/fma62001>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0103217>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "diencephalon"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0103217>",
                    "rdfs:subClassOf",
                    "<http://uri.interlex.org/base/ilx_0109835>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0103217>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "thalamencephalon"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0103217>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Between brain"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0103217>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Interbrain"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "score",
                    "216.32",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "version",
                    "18",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "owlEquivalent",
                    "owl:Class",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "lastModify",
                    "2022-04-30",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "lastModifyBy",
                    "Neurolex",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "submittedBy",
                    "First User",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "preferredId",
                    "Neurolex Preferred ID",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "organization",
                    "First Organization",
                  ]
                ]
              },
              {
                "id" : "ilx_0109019",
                "prefixes": {
                  "owl": "http://www.w3.org/2002/07/owl#",
                  "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                  "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
                  "xsd": "http://www.w3.org/2001/XMLSchema#",
                  "xml": "http://www.w3.org/XML/1998/namespace",
                  "": "file:///ERROR/EMPTY/PREFIX/BANNED/"
                },
                "triples": [
                  [
                    "<http://uri.interlex.org/base/ilx_0109019>",
                    "rdfs:label",
                    "Pons"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0109019>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "pons cerebri"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0109019>",
                    "<http://purl.obolibrary.org/obo/IAO_0000115>",
                    "The part of the central nervous system lying between the medulla oblongata and the mesencephalon, ventral to the cerebellum, and consisting of a pars dorsalis and a pars ventralis. (MeSH) The ventral topographic division of the hindbrain; the dorsal topographic division is the cerebellum. The middle cerebellar peduncle on the periphery of the macrodissected adult human pons (\"bridge\" in English) was identified by Varolio (1573, Fig. I, f. 17v; also see Clarke &amp; O'Malley 1996, pp. 634-635, 821). Collins (1685, see Tab. 48-L, his caudex of medulla oblongata) identified the pons as defined here, and Haller (1747, see translation by Mihles, 1754, pp. 287, 296) provided the term itself. Pons Varolii (Bell, 1802) is a synonym."
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0109019>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "pons of Varolius"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0109019>",
                    "<http://uri.interlex.org/base/ilx_0112796>",
                    "<http://uri.interlex.org/base/ilx_0105004>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0109019>",
                    "rdf:type",
                    "owl:Class"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0109019>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://purl.org/sig/ont/fma/fma67943>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0109019>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://purl.obolibrary.org/obo/UBERON_0000988>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0109019>",
                    "rdfs:subClassOf",
                    "<http://uri.interlex.org/base/ilx_0109835>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0109019>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Metencephalon"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0109019>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "pons Varolii"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0109019>",
                    "<http://uri.interlex.org/base/ilx_0112785>",
                    "<http://uri.interlex.org/base/ilx_0101999>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0109019>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://uri.neuinfo.org/nif/nifstd/birnlex_733>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "score",
                    "216.32",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "version",
                    "18",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "owlEquivalent",
                    "owl:Class",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "lastModify",
                    "2022-04-30",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "lastModifyBy",
                    "Neurolex",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "submittedBy",
                    "First User",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "preferredId",
                    "Neurolex Preferred ID",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "organization",
                    "First Organization",
                  ]
                ]
              },
              {
                "id" : "ilx_0102003",
                "prefixes": {
                  "owl": "http://www.w3.org/2002/07/owl#",
                  "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                  "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
                  "xsd": "http://www.w3.org/2001/XMLSchema#",
                  "xml": "http://www.w3.org/XML/1998/namespace",
                  "": "file:///ERROR/EMPTY/PREFIX/BANNED/"
                },
                "triples": [
                  [
                    "<http://uri.interlex.org/base/ilx_0102003>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "cerebrum"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0102003>",
                    "<http://purl.obolibrary.org/obo/IAO_0000115>",
                    "Gross division of the brain.  The term cerebrum has several definitions ranging in generality from equivalence to the term \"brain\" to the sum of the left cerebral hemisphere and right hemisphere, to a composite structure consisting of the cerebral cortex and adjacent cerebral white matter. A thorough discussion of the nature and history of the different definitions is presented in Anthoney-94 (NeuroNames)."
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0102003>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "hemispherium cerebri"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0102003>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "nucleus medialis amygdalae"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0102003>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "medial amygdalar nucleus"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0102003>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "nucleus amygdaloideus medialis"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0102003>",
                    "rdfs:label",
                    "Cerebrum"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0102003>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://uri.neuinfo.org/nif/nifstd/birnlex_1042>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0102003>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://purl.obolibrary.org/obo/UBERON_0001869>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0102003>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://purl.org/sig/ont/fma/fma61817>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0102003>",
                    "rdf:type",
                    "owl:Class"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0102003>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "hemispheric regions"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0102003>",
                    "rdfs:subClassOf",
                    "<http://uri.interlex.org/base/ilx_0109835>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0102003>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "hemisphere"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "score",
                    "216.32",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "version",
                    "18",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "owlEquivalent",
                    "owl:Class",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "lastModify",
                    "2022-04-30",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "lastModifyBy",
                    "Neurolex",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "submittedBy",
                    "First User",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "preferredId",
                    "Neurolex Preferred ID",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "organization",
                    "First Organization",
                  ]
                ]
              },
              {
                "id" : "ilx_0108544",
                "prefixes": {
                  "owl": "http://www.w3.org/2002/07/owl#",
                  "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                  "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
                  "xsd": "http://www.w3.org/2001/XMLSchema#",
                  "xml": "http://www.w3.org/XML/1998/namespace",
                  "": "file:///ERROR/EMPTY/PREFIX/BANNED/"
                },
                "triples": [
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "posterior lobe"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "rdfs:subClassOf",
                    "<http://uri.interlex.org/base/ilx_0109835>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/ilx_0112785>",
                    "<http://uri.interlex.org/base/ilx_0107477>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "neural component of pituitary"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "posterior lobe-3"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "pars posterior"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "PNHP"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "pars nervosa of pituitary"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "eminentia mediana"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Pars nervosa pituitary gland"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "pituitary gland"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://purl.obolibrary.org/obo/IAO_0000115>",
                    "The posterior pituitary (or neurohypophysis) comprises the posterior lobe of the pituitary gland and is part of the endocrine system. Despite its name, the posterior pituitary gland is not a gland, per se; rather, it is largely a collection of axonal projections from the hypothalamus that terminate behind the anterior pituitary gland. [WP,unvetted]."
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "pars nervosa (hypophysis)"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://purl.org/sig/ont/fma/fma74636>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "pars nervosa of neurohypophysis"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "pars nervosa neurohypophysis"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Posterior pituitary"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "lobus nervosus (Neurohypophysis)"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "eminentia postinfundibularis"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "pars nervosa"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Posterior lobe of pituitary"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "eminentia medialis (Shantha)"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "rdfs:label",
                    "Pars nervosa of hypophysis"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Pituitary gland, posterior lobe"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "lobe caudalis cerebelli"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "medial eminence"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "middle lobe"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "pars nervosa (neurohypophysis)"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "rdf:type",
                    "owl:Class"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://uri.neuinfo.org/nif/nifstd/birnlex_941>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "pars posterior of hypophysis"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "posterior lobe of neurohypophysis"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "caudal lobe"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Pars nervosa of posterior lobe of pituitary gland"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Pars nervosa of hypophysis"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0108544>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://purl.obolibrary.org/obo/UBERON_0003217>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "score",
                    "216.32",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "version",
                    "18",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "owlEquivalent",
                    "owl:Class",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "lastModify",
                    "2022-04-30",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "lastModifyBy",
                    "Neurolex",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "submittedBy",
                    "First User",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "preferredId",
                    "Neurolex Preferred ID",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "organization",
                    "First Organization",
                  ]
                ]
              },
              {
                "id" : "ilx_0726868",
                "prefixes": {
                  "owl": "http://www.w3.org/2002/07/owl#",
                  "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                  "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
                  "xsd": "http://www.w3.org/2001/XMLSchema#",
                  "xml": "http://www.w3.org/XML/1998/namespace",
                  "": "file:///ERROR/EMPTY/PREFIX/BANNED/"
                },
                "triples": [
                  [
                    "<http://uri.interlex.org/base/ilx_0726868>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://purl.org/sig/ont/fma/fma62007>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0726868>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "dorsal tier of thalamus"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0726868>",
                    "rdf:type",
                    "owl:Class"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0726868>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "thalamus dorsalis"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0726868>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "dorsal thalamus (Anthoney)"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0726868>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "dorsal thalamus"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0726868>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "thalamus proper"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0726868>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://purl.obolibrary.org/obo/UBERON_0004703>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0726868>",
                    "<http://purl.obolibrary.org/obo/IAO_0000115>",
                    "Organ component of neuraxis, each instance of which is a large oval mass in the posterior part of some diencephalon adjacent to the lateral wall of some thrid ventricle, containing groups of some nuclei serving as relay centers for sensory impulses and cerebellar and basal nuclear rpojections to some cerebral cortex."
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0726868>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "thalamus, pars dorsalis"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0726868>",
                    "rdfs:label",
                    "dorsal thalamus"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "score",
                    "216.32",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "version",
                    "18",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "owlEquivalent",
                    "owl:Class",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "lastModify",
                    "2022-04-30",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "lastModifyBy",
                    "Neurolex",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "submittedBy",
                    "First User",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "preferredId",
                    "Neurolex Preferred ID",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "organization",
                    "First Organization",
                  ]
                ]
              },
              {
                "id" : "ilx_0111657",
                "prefixes": {
                  "owl": "http://www.w3.org/2002/07/owl#",
                  "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                  "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
                  "xsd": "http://www.w3.org/2001/XMLSchema#",
                  "xml": "http://www.w3.org/XML/1998/namespace",
                  "": "file:///ERROR/EMPTY/PREFIX/BANNED/"
                },
                "triples": [
                  [
                    "<http://uri.interlex.org/base/ilx_0111657>",
                    "<http://uri.interlex.org/base/ilx_0112785>",
                    "<http://uri.interlex.org/base/ilx_0101999>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0111657>",
                    "rdfs:subClassOf",
                    "<http://uri.interlex.org/base/ilx_0109835>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0111657>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://purl.obolibrary.org/obo/UBERON_0001897>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0111657>",
                    "rdfs:label",
                    "Thalamus"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0111657>",
                    "rdf:type",
                    "owl:Class"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0111657>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Parencephalon"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0111657>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "thalamus opticus"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0111657>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "thalami"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0111657>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://uri.neuinfo.org/nif/nifstd/birnlex_954>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0111657>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "thalamus"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0111657>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "wider thalamus"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0111657>",
                    "<http://purl.obolibrary.org/obo/IAO_0000115>",
                    "Subcortical brain region consisting of paired gray matter bodies in the dorsal diencephalon and forming part of the lateral wall of the third ventricle of the brain. The thalamus represents the major portion of the diencephalon and is commonly divided into cellular aggregates known as nuclear groups.(MeSH).The dorsal topographic division of the interbrain. The macrodissected adult human thalamus was clearly illustrated by Vesalius in 1543 and the term as defined here was introduced by His in 1893. It includes the traditional epithalamus, dorsal thalamus, and ventral thalamus of Herrick (1910, pp. 494, 498). Also see Kuhlenbeck (1927, Ch. 9) and Jones (1985, p. 87)."
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0111657>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "thalamencephalon"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0111657>",
                    "<http://uri.interlex.org/base/ilx_0112785>",
                    "<http://uri.interlex.org/base/ilx_0103217>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0111657>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Th"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "score",
                    "216.32",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "version",
                    "18",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "owlEquivalent",
                    "owl:Class",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "lastModify",
                    "2022-04-30",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "lastModifyBy",
                    "Neurolex",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "submittedBy",
                    "First User",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "preferredId",
                    "Neurolex Preferred ID",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "organization",
                    "First Organization",
                  ]
                ]
              },
              {
                "id" : "ilx_0100741",
                "prefixes": {
                  "owl": "http://www.w3.org/2002/07/owl#",
                  "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                  "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
                  "xsd": "http://www.w3.org/2001/XMLSchema#",
                  "xml": "http://www.w3.org/XML/1998/namespace",
                  "": "file:///ERROR/EMPTY/PREFIX/BANNED/"
                },
                "triples": [
                  [
                    "<http://uri.interlex.org/base/ilx_0100741>",
                    "<http://uri.interlex.org/base/ilx_0112785>",
                    "<http://uri.interlex.org/base/ilx_0109258>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0100741>",
                    "rdfs:label",
                    "Anterior pretectal nucleus"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0100741>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://purl.obolibrary.org/obo/UBERON_0034918>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0100741>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "anterior pretectal nucleus"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0100741>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://uri.neuinfo.org/nif/nifstd/nlx_144456>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0100741>",
                    "<http://purl.obolibrary.org/obo/IAO_0000115>",
                    "'Anterior pretectal nucleus' is a nucleus of midbrain tectum and pretectal nucleus."
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0100741>",
                    "rdfs:subClassOf",
                    "<http://uri.interlex.org/base/ilx_0109835>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0100741>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "anterior (ventral /principal) pretectal nucleus"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0100741>",
                    "rdf:type",
                    "owl:Class"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "score",
                    "216.32",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "version",
                    "18",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "owlEquivalent",
                    "owl:Class",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "lastModify",
                    "2022-04-30",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "lastModifyBy",
                    "Neurolex",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "submittedBy",
                    "First User",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "preferredId",
                    "Neurolex Preferred ID",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "organization",
                    "First Organization",
                  ]
                ]
              },
              {
                "id" : "ilx_0106736",
                "prefixes": {
                  "owl": "http://www.w3.org/2002/07/owl#",
                  "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                  "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
                  "xsd": "http://www.w3.org/2001/XMLSchema#",
                  "xml": "http://www.w3.org/XML/1998/namespace",
                  "": "file:///ERROR/EMPTY/PREFIX/BANNED/"
                },
                "triples": [
                  [
                    "<http://uri.interlex.org/base/ilx_0106736>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "bulbus"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0106736>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "metepencephalon"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0106736>",
                    "<http://uri.interlex.org/base/ilx_0112785>",
                    "<http://uri.interlex.org/base/ilx_0101999>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0106736>",
                    "rdf:type",
                    "owl:Class"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0106736>",
                    "<http://purl.obolibrary.org/obo/IAO_0000115>",
                    "The lower portion of the hindbrain and brainstem located between the pons and spinal cord. This structure contains several descending and ascending tracts, lower cranial nerve nuclei, a significant proportion of the reticular system of the brainstem and other structures (adapted from NCI Thesaurus).The topographic division of the cerebrospinal axis between pons and spinal cord. It was clearly described and illustrated for macrodissected adult humans by Piccolomini (1586, pp. 265, 269; his intracranial medulla oblongata), while the term medulla was used by Winslow (1733, Sect. X, p. 42) and Haller (1747, see translation by Mihles, 1754, pp. 287, 286), and more recently in the classic textbooks of for example Mettler (1948, p. 76) and Carpenter (1976, p. 60)."
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0106736>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Afterbrain"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0106736>",
                    "<http://uri.interlex.org/base/ilx_0112796>",
                    "<http://uri.interlex.org/base/ilx_0105004>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0106736>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://uri.neuinfo.org/nif/nifstd/birnlex_957>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0106736>",
                    "rdfs:label",
                    "Medulla oblongata"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0106736>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "medulla"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0106736>",
                    "rdfs:subClassOf",
                    "<http://uri.interlex.org/base/ilx_0109835>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0106736>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Bulb"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0106736>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Metencephalon"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0106736>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://purl.org/sig/ont/fma/fma62004>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0106736>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Epencephalon"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0106736>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "medulla oblonzata"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "score",
                    "216.32",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "version",
                    "18",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "owlEquivalent",
                    "owl:Class",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "lastModify",
                    "2022-04-30",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "lastModifyBy",
                    "Neurolex",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "submittedBy",
                    "First User",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "preferredId",
                    "Neurolex Preferred ID",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "organization",
                    "First Organization",
                  ]
                ]
              },
              {
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
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "score",
                    "216.32",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "version",
                    "18",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "owlEquivalent",
                    "owl:Class",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "lastModify",
                    "2022-04-30",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "lastModifyBy",
                    "Neurolex",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "submittedBy",
                    "First User",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "preferredId",
                    "Neurolex Preferred ID",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "organization",
                    "First Organization",
                  ]
                ]
              },
              {
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
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "score",
                    "216.32",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "version",
                    "18",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "owlEquivalent",
                    "owl:Class",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "lastModify",
                    "2022-04-30",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "lastModifyBy",
                    "Neurolex",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "submittedBy",
                    "First User",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "preferredId",
                    "Neurolex Preferred ID",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "organization",
                    "First Organization",
                  ]
                ]
              },
              {
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
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "score",
                    "216.32",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "version",
                    "18",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "owlEquivalent",
                    "owl:Class",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "lastModify",
                    "2022-04-30",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "lastModifyBy",
                    "Neurolex",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "submittedBy",
                    "First User",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "preferredId",
                    "Neurolex Preferred ID",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "organization",
                    "First Organization",
                  ]
                ]
              }, 
              {
                id : "ilx_0101499",
                "prefixes": {
                  "owl": "http://www.w3.org/2002/07/owl#",
                  "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                  "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
                  "xsd": "http://www.w3.org/2001/XMLSchema#",
                  "xml": "http://www.w3.org/XML/1998/namespace",
                  "": "file:///ERROR/EMPTY/PREFIX/BANNED/"
                },
                "triples": [
                  [
                    "<http://uri.interlex.org/base/ilx_0101499>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Bupropion Hcl"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101499>",
                    "<http://uri.interlex.org/base/ilx_0112796>",
                    "<http://uri.interlex.org/base/ilx_0102133>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101499>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Wellbutrin SR"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101499>",
                    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>",
                    "<http://purl.obolibrary.org/obo/CHEBI_3219>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101499>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Wellbatrin"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101499>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Wellbutrin XL"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101499>",
                    "<http://uri.interlex.org/base/ilx_0112784>",
                    "<http://uri.interlex.org/base/ilx_0103576>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101499>",
                    "rdfs:label",
                    "Bupropion"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101499>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Wellbutrin"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101499>",
                    "rdf:type",
                    "owl:Class"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101499>",
                    "rdfs:subClassOf",
                    "<http://uri.interlex.org/base/ilx_0107064>"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101499>",
                    "<http://purl.obolibrary.org/obo/IAO_0000115>",
                    "A unicyclic, aminoketone antidepressant. The mechanism of its therapeutic actions is not well understood, but it does appear to block dopamine uptake. The hydrochloride is available as an aid to smoking cessation treatment. (PubChem) Pharmacology: Bupropion, an antidepressant of the aminoketone class and a non-nicotine aid to smoking cessation, is chemically unrelated to tricyclic, tetracyclic, selective serotonin re-uptake inhibitor, or other known antidepressant agents. Compared to classical tricyclic antidepressants, Bupropion is a relatively weak inhibitor of the neuronal uptake of norepinephrine, serotonin, and dopamine. In addition, Bupropion does not inhibit monoamine oxidase. Bupropion produces dose-related central nervous system (CNS) stimulant effects in animals, as evidenced by increased locomotor activity, increased rates of responding in various schedule-controlled operant behavior tasks, and, at high doses, induction of mild stereotyped behavior. Mechanism of action: Bupropion selectively inhibits the neuronal reuptake of dopamine, norepinephrine, and serotonin; actions on dopaminergic systems are more significant than imipramine or amitriptyline whereas the blockade of norepinephrine and serotonin reuptake at the neuronal membrane is weaker for bupropion than for tricyclic antidepressants. The increase in norepinephrine may attenuate nicotine withdrawal symptoms and the increase in dopamine at neuronal sites may reduce nicotine cravings and the urge to smoke. Bupropion exhibits moderate anticholinergic effects. Drug type: Approved. Small Molecule. Drug category: Antidepressive Agents. Antidepressive Agents, Second-Generation. Dopamine Uptake Inhibitors"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101499>",
                    "<http://uri.interlex.org/base/readable/synonym>",
                    "Amfebutamone"
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "score",
                    "216.32",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "version",
                    "18",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "owlEquivalent",
                    "owl:Class",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "lastModify",
                    "2022-04-30",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "lastModifyBy",
                    "Neurolex",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "submittedBy",
                    "First User",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "hierarchy",
                    "Test Hierarchy",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "preferredId",
                    "Neurolex Preferred ID",
                  ],
                  [
                    "<http://uri.interlex.org/base/ilx_0101431>",
                    "organization",
                    "First Organization",
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
