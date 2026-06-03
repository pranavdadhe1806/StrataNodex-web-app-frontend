import client from './client';

export interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiOperation {
  op: string;
  [key: string]: unknown;
}

export interface AiChatResponse {
  operations: AiOperation[];
  confirmation: string | null;
  followUpQuestion: string | null;
  clarificationNeeded: string | null;
  usage: { used: number; limit: number };
  sessionId: string; // always returned now
}

export interface AiSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiSessionDetail extends AiSession {
  messages: AiSessionMessage[];
}

export interface AiSessionMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export const aiApi = {
  chat: (
    message: string,
    sessionId: string | null,
    currentContext?: { folderId?: string; listId?: string },
  ) =>
    client
      .post<AiChatResponse>('/ai/chat', { message, sessionId, currentContext })
      .then((r) => r.data),

  getSessions: () =>
    client.get<AiSession[]>('/ai/sessions').then((r) => r.data),

  createSession: () =>
    client.post<AiSession>('/ai/sessions', { title: 'New Chat' }).then((r) => r.data),

  getSession: (id: string) =>
    client.get<AiSessionDetail>(`/ai/sessions/${id}`).then((r) => r.data),

  deleteSession: (id: string) =>
    client.delete(`/ai/sessions/${id}`).then((r) => r.data),
};
