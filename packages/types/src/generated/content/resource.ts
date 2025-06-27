export interface Resource {
  id: string;
  category: string;
  path: string;
  lastUpdated: Date;
  lastCommit: string;
  lastSync: Date;
}

export interface ResourceTag {
  resourceId: string;
  tagId: number;
}

export interface Tags {
  id: number;
  name: string;
}
