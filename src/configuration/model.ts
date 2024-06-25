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
    status : "status",
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
        key : termKeys.hasIlxPreferredId
    },
    "http://uri.interlex.org/tgbugs/uris/readable/hasIlxId" : {
        key : termKeys.hasIlxId
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
    "http://uri.interlex.org/tgbugs/uris/readable/status" : {
        key : termKeys.status,
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
    "http://uri.interlex.org/tgbugs/uris/readable/organization" : {
        key : termKeys.organization,
    }
}

export const variantKeys = {
    ...termKeys,
    status : "status",
    originatingUser : "originatingUser",
    editingUser : "editingUser",
    organization : "organization"
}

export const variantPrefixes = {
    ...termPredicates,
    "http://uri.interlex.org/tgbugs/uris/readable/status" : {
        key : variantKeys.status,
    },
    "http://uri.interlex.org/tgbugs/uris/readable/originatingUser" : {
        key : variantKeys.originatingUser,
    },
    "http://uri.interlex.org/tgbugs/uris/readable/editingUser" : {
        key : variantKeys.editingUser,
    },
}

export const versionKeys = {
    author : "author",
    fork : "fork",
    action : "action",
    lastModifyBy : "lastModifyBy",
}

export const versionPrefixes = {
    "http://uri.interlex.org/tgbugs/uris/readable/action" : {
        key : versionKeys.action,
    },
    "rdfs:name" : {
        key : versionKeys.author,
    },
    "http://uri.interlex.org/tgbugs/uris/readable/fork" : {
        key : versionKeys.fork,
    },
    "http://uri.interlex.org/tgbugs/uris/readable/lastModifyBy" : {
        key : versionKeys.lastModifyBy,
    }
}

export const predicateKeys = {
    subject : "author",
    predicate : "fork",
    object : "action",
}

export const predicatePrefixes = {
    "http://uri.interlex.org/tgbugs/uris/readable/subject" : {
        key : predicateKeys.subject,
    },
    "http://uri.interlex.org/tgbugs/uris/readable/predicate" : {
        key : predicateKeys.predicate,
    },
    "http://uri.interlex.org/tgbugs/uris/readable/object" : {
        key : predicateKeys.object,
    }
}