export interface Organization {
    id: string;
    preferredId:string;
    organization:string;
    label: string;
    description: string;
    type: string;
    version : string;
    lastModify : string;
    existingID : string[];
    status : string;
    originatingUser : object;
    editingUser : object;
  }
  
  export type Organizations = Organization[];