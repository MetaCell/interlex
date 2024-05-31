export const keys = {
    id : "id",
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

export const predicates = {
    "<http://uri.interlex.org/base/readable/synonym>" : {
        key : keys.synonym,
    },
    "<http://uri.interlex.org/tgbugs/uris/readable/hasExistingId>" : {
        key : keys.existingID,
    },
    "<http://purl.obolibrary.org/obo/IAO_0000115>" : {
        key : keys.description,
    },
    "rdfs:label" : {
        key : keys.label,
    },
    "rdf:type" : {
        key : keys.type,
    },
    "id" : {
        key : keys.id,
    },
    "score" : {
        key : keys.score,
    },
    "version" : {
        key : keys.version,
    },
    "owlEquivalent" : {
        key : keys.owlEquivalent,
    },
    "lastModify" : {
        key : keys.lastModify,
    },
    "lastModifyBy" : {
        key : keys.lastModifyBy,
    },
    "predicates" : {
        key : keys.predicates,
    },
    "hierarchy" : {
        key : keys.hierarchy,
    },
    "submittedBy" : {
        key : keys.submittedBy,
    }
}