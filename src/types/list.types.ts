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
}
