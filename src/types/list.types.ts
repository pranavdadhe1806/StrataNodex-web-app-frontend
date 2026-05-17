export interface ListNodePreview {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
}

export interface List {
  id: string;
  name: string;
  folderId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    nodes: number;
  };
  nodes?: ListNodePreview[];
}
