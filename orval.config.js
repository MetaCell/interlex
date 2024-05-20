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
      mock: true,
      override: {
        mutator: {
          path: './src/api/mutator/custom-client.ts',
          name: 'customInstance',
        },
        operations: {
          new_user: {
            mock: {
              data: () => ({
                userID: "Sample UserID",
                userName: "testUser",
                statusCode: 200,
                message: "",
                description: "",
                redirect_url: "",
              }),
            },
          },
          login: {
            mock: {
              data: () => ({
                userID: "Sample UserID",
                userName: "testUser",
                statusCode: 200,
                message: "",
                description: "",
                redirect_url: "",
              }),
            },
          },
          logout: {
            mock: {
              data: () => ({
                userID: "Sample UserID",
                userName: "testUser",
                statusCode: 200,
                message: "",
                description: "",
                redirect_url: "",
              }),
            },
          },
          new_organization: {
            mock: {
              data: () => ({
                name: "New Organization",
                creationDate: "01/01/2000",
                statusCode: 200,
                message: "",
                description: "",
                redirect_url: "",
              }),
            },
          },
          get_organization: {
            mock: {
              data: () => ({
                name: "Organization",
                creationDate: "01/01/2000",
                statusCode: 200,
                message: "",
                description: "",
                redirect_url: "",
              }),
            },
          },
          get_organizations: {
            mock: {
              data: () => [
                {
                  name: "Organization",
                  creationDate: "01/01/2000",
                  statusCode: 200,
                  message: "",
                  description: "",
                  redirect_url: "",
                },
                {
                  name: "Organization 2",
                  creationDate: "01/02/2000",
                  statusCode: 200,
                  message: "",
                  description: "",
                  redirect_url: "",
                },
                {
                  name: "Organization 3",
                  creationDate: "01/03/2000",
                  statusCode: 200,
                  message: "",
                  description: "",
                  redirect_url: "",
                },
              ],
            },
          },
          // Search for specific 'term' and get all results
          get_match_terms: {
            mock: {
              data: () => ({
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
        /**
         * TODO : New endpoint needed for 'tabular view of similar terms'
         * Suggestion, operation returns array of similar
         * */
        get_terms: {
          mock: {
            properties: () => {
              return {
                '[].id': () => 1,
              };
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
            data: () => [],
          },
        },
        /** TODO : Missing endpoint and operation.
         * Use case, download all ontologies matching a single term
         * */
        get_all_ontologies_matching_term: {
          mock: {
            data: () => [],
          },
        },
      },
      allParamsOptional: true,
      urlEncodeParameters: true,
    },
  },
};
