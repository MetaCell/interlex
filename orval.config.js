import { mockOntologies } from "./mock/data/mockOntologies";
import { mockOrganization, mockOrganizations } from "./mock/data/mockOrganizations";
import { mockTerms, mockTerm } from "./mock/data/mockTerms";
import { mockVariants } from "./mock/data/mockVariants";
import { mockVersions } from "./mock/data/mockVersions"
import { mockCuries } from "./mock/data/mockCuries"

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
          path: './mock/mutator/customClient.ts',
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
          get_endpoints_curies_ : {
            mock: {
              data : mockCuries
            }
          },
          // Override existing endpoint, return mock data for fragment ID ilx_0101431
          get_endpoints_ilx: {
            mock: {
              data: mockTerm,
            },
          },
          get_endpoints_ilx_get: {
            mock: {
              data: mockTerm,
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
      baseUrl: 'https://uri.olympiangods.org',
      mock: true,
      override: {
        mutator: {
          path: './mock/mutator/customClient.ts',
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
          get_curies : {
            mock: {
              data : mockCuries
            }
          },
          get_variants : {
            mock: {
              data : mockVariants
            }
          },
          get_versions : {
            mock: {
              data : mockVersions
            }
          },
          get_discussions : {
            mock: {
              data : []
            }
          },
          get_hierarchies : {
            mock: {
              data : () => [{
                rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                rdfs: "http://www.w3.org/2000/01/rdf-schema#",
                owl: "http://www.w3.org/2002/07/owl#"
              }]
            }
          },
          get_organization: {
            mock: {
              data: mockOrganization,
            },
          },
          get_organizations: {
            mock: {
              data: mockOrganizations,
            },
          },
          // Search for specific 'term' and get all results
          get_match_terms: {
            mock: {
              data: mockTerms,
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
            data: mockOntologies,
          },
        },
        /** TODO : Missing endpoint and operation.
         * Use case, download all ontologies matching a single term
         * */
        get_all_ontologies_matching_term: {
          mock: {
            data: mockOntologies,
          },
        },
      }
    },
  },
};
