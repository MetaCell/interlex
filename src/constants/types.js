export const SEARCH_TYPES = {
    TERM: "term",
    ORGANIZATION: "organization",
    ONTOLOGY: "ontology",
};

export const TERM_TYPES = {
    CLASS: 'owl:Class',
    ANNOTATION_PROPERTY: 'owl:AnnotationProperty',
    OBJECT_PROPERTY: 'owl:ObjectProperty',
    CDE: 'TODO:CDE',
    FDE: 'TODO:FDE',
    PDE: 'TODO:PDE'
};

export const TYPES = Object.values(TERM_TYPES);
export const DEFAULT_TYPE = TERM_TYPES.CLASS;
