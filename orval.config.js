import { mockOntologies } from "./mock/data/mockOntologies";
import { mockOrganization, mockOrganizations } from "./mock/data/mockOrganizations";
import { mockTerms, mockTerm } from "./mock/data/mockTerms";
import { mockSearch } from "./mock/data/mockSearch";
import { mockVariants, mockVariant } from "./mock/data/mockVariants";
import { mockVersions } from "./mock/data/mockVersions";
import { mockCuries } from "./mock/data/mockCuries";
import { mockSignup, mockUser } from "./mock/data/mockUser";
import { mockForks } from "./mock/data/mockForks";
import { mockPatchBulkTermsResponse, mockPatchTermResponse } from "./mock/data/mockPatchTermResponse";
import { mockDiscussions, mockPostMessage } from "./mock/data/mockDiscussions";

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
      client: 'react-query',
      override: {
        mutator: {
          path: './mock/mutator/customClient.ts',
          name: 'customInstance',
        },
        allParamsOptional: true,
        urlEncodeParameters: true,
      },
    },
  },
  interlex: {
    input: {
      target: "./interlex.yaml",
      validation : true
    },
    output: {
      mode: "split",
      target: "./src/api/endpoints",
      schemas: "./src/model/backend",
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
          get_user: {
            mock: {
              data: mockUser,
            },
          },
          get_user_terms: {
            mock: {
              data: mockTerms,
            },
          },
          get_user_organizations: {
            mock: {
              data: mockOrganizations,
            },
          },
          get_user_forks: {
            mock: {
              data: mockForks,
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
          signup: {
            mock: {
              data: mockSignup
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
          get_variant : {
            mock: {
              data : mockVariant
            }
          },
          get_versions : {
            mock: {
              data : mockVersions
            }
          },
          get_term_discussions : {
            mock: {
              data : mockDiscussions
            }
          },
          get_variant_discussions : {
            mock: {
              data : mockDiscussions
            }
          },
          add_to_term_discussion : {
            mock: {
              data : mockPostMessage
            }
          },
          add_to_variant_discussion : {
            mock: {
              data : mockPostMessage
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
          get_organizations_terms: {
            mock: {
              data: mockTerms,
            },
          },
          get_organizations_curies: {
            mock: {
              data: mockCuries,
            },
          },
          get_organizations_ontologies: {
            mock: {
              data: mockOntologies,
            },
          },
          bulk_edit_terms: {
            mock: {
              data: mockPatchBulkTermsResponse
            },
          },
          add_term: {
            mock: {
              data: mockPatchTermResponse
            },
          },        
          // Search for specific 'term' and get all results
          get_match_terms: {
            mock: {
              data: mockTerms,
            },
            query: {
              useQuery: true,
              useSuspenseQuery: true,
              useSuspenseInfiniteQuery: true,
              useInfinite: true,
              useInfiniteQueryParam: ['filter', "value"],
            },
          },
          search_all :{
            mock : {
              data : mockSearch
            },
            query: {
              useQuery: true,
              useSuspenseQuery: true,
              useSuspenseInfiniteQuery: true,
              useInfinite: true,
              useInfiniteQueryParam: ['filter', "value"],
            },
          }
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
