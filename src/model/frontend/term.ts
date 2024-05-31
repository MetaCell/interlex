export interface Term {
  /** Unique identifier */
  id: string;
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
}
