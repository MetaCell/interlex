export const termKeys = {
    id : "id",
    preferredId : "preferredId",
    organization : "organization",
    label : "label",
    description : "description",
    synonym : "synonym",
    existingID : "existingID",
    type : "type",
    score : "score",
    version : "version",
    owlEquivalent : "owlEquivalent",
    lastModify : "lastModify",
    lastModifyBy : "lastModifyBy",
    hierarchy : "hierarchy",
    predicates : "predicates",
    submittedBy : "submittedBy"
}

export const termPredicates = {
    "<http://uri.interlex.org/base/readable/synonym>" : {
        key : termKeys.synonym,
    },
    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>" : {
        key : termKeys.existingID,
    },
    "<http://purl.obolibrary.org/obo/IAO_0000115>" : {
        key : termKeys.description,
    },
    "rdfs:label" : {
        key : termKeys.label,
    },
    "rdf:type" : {
        key : termKeys.type,
    },
    "id" : {
        key : termKeys.id,
    },
    "score" : {
        key : termKeys.score,
    },
    "version" : {
        key : termKeys.version,
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