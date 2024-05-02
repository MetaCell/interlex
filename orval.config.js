module.exports = {
  "interlex-api": {
    input: {
      target: "https://uri.olympiangods.org/docs/swagger.json",
      validation: false,
      // override: {
      //     transformer: 'src/transformer/remove-duplicates.js',
      // },
    },
    output: {
      mode: "split",
      target: "src/endpoints",
      baseUrl: "/api/v1",
      schemas: "./src/model",
      client: "react-query",
      mock: true,
      override: {
        operations: {
          get_endpoints_ilx: {
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
          signup: {
            mock: {
              data: () => ({
                userID: "userID",
                name: "name",
                lastName: "lastName",
                institution: "institution",
                email: "email",
                userName: "userName",
                password: "password",
              }),
            },
          },
          login: {
            mock: {
              data: () => ({
                userID: "userID",
                userName: "userName",
                password: "password",
              }),
            },
          },
          signout: {
            mock: {
              data: () => ({
                userID: "userID",
                userName: "userName",
                password: "password",
              }),
            },
          },
        },
      },
      allParamsOptional: true,
      urlEncodeParameters: true,
    },
  },
};
