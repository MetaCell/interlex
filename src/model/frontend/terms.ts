export interface Term {
    /** Unique identifier */
    id: string;
    preferredId:string;
    organization:string;
    label: string;
    description: string;
    synonyms: string[];
    type: string;
    score : string;
    version : string;
    owlEquivalent : string;
    lastModifyBy : string;
    lastModify : string;
    submittedBy : string;
    hierarchy : string[];
    existingID : string[];
    predicates : object;
  }
  
export type Terms = Term[];