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
}

export const aiApi = {
  chat: (
    message: string,
    conversationHistory: AiMessage[],
    currentContext?: { folderId?: string; listId?: string },
  ) =>
    client
      .post<AiChatResponse>('/ai/chat', { message, conversationHistory, currentContext })
      .then((r) => r.data),
};
