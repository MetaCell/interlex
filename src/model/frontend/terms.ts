export interface Term {
    id: string;
    preferredId:string;
    organization:string;
    label: string;
    description: string;
    synonyms: string[];
    status: string;
    type : string;
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