export interface Version {
  /** Unique identifier */
  action:string;
  fork:string;
  author: string;
  date: string;
}

export type Versions = Version[];
