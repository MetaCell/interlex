export const termKeys = {
    id : "id",
    preferredId : "preferredId",
    organization : "organization",
    label : "label",
    subClassOf : "subClassOf",
    description : "description",
    synonym : "synonym",
    existingID : "existingID",
    hasIlxId : "hasIlxId",
    hasIlxPreferredId : "hasIlxPreferredId",
    type : "type",
    score : "score",
    version : "version",
    owlEquivalent : "owlEquivalent",
    lastModify : "lastModify",
    lastModifyBy : "lastModifyBy",
    hierarchy : "hierarchy",
    predicates : "predicates",
    submittedBy : "submittedBy",
    versionIRI : "versionIRI",
    versionInfo : "versionInfo"
}

export const termPredicates = {
    "http://uri.interlex.org/base/readable/synonym" : {
        key : termKeys.synonym,
    },
    "http://uri.interlex.org/tgbugs/uris/readable/hasExistingId" : {
        key : termKeys.existingID,
    },
    "http://uri.interlex.org/tgbugs/uris/readable/hasIlxPreferredId" : {
        key : termKeys.hasIlxPreferredId,
    },
    "http://uri.interlex.org/tgbugs/uris/readable/hasIlxId" : {
        key : termKeys.hasIlxId,
    },
    "http://purl.obolibrary.org/obo/IAO_0000115" : {
        key : termKeys.description,
    },
    "@id" : {
        key : termKeys.id,
    },
    "rdfs:label" : {
        key : termKeys.label,
    },
    "rdfs:subClassOf" : {
        key : termKeys.subClassOf,
    },
    "@type" : {
        key : termKeys.type,
    },
    "id" : {
        key : termKeys.id,
    },
    "score" : {
        key : termKeys.score,
    },
    "owl:versionIRI" : {
        key : termKeys.versionIRI,
    },
    "owl:versionInfo" : {
        key : termKeys.versionInfo,
    },
    "owlEquivalent" : {
        key : termKeys.owlEquivalent,
    },
    "lastModify" : {
        key : termKeys.lastModify,
    },
    "lastModifyBy" : {
        key : termKeys.lastModifyBy,
    },
    "predicates" : {
        key : termKeys.predicates,
    },
    "hierarchy" : {
        key : termKeys.hierarchy,
    },
    "submittedBy" : {
        key : termKeys.submittedBy,
    },
    "preferredId" : {
        key : termKeys.preferredId,
    },
    "organization" : {
        key : termKeys.organization,
    }
}