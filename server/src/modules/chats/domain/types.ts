export interface ChatData {
  id: string;
  objectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessageData {
  id: string;
  chatId: string;
  content: string;
  type: "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
  author: string;
  taskId?: string;
  isEditSuggestion: boolean;
  isCompletionConfirmation: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: Date;
}

export interface CreateChatData {
  objectId: string;
}

export interface CreateChatMessageData {
  chatId: string;
  content: string;
  type?: "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
  author: string;
  taskId?: string;
  isEditSuggestion?: boolean;
  isCompletionConfirmation?: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface UpdateChatMessageData {
  content?: string;
  type?: "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
  author?: string;
  taskId?: string;
  isEditSuggestion?: boolean;
  isCompletionConfirmation?: boolean;
}

export interface ChatWithMessages extends ChatData {
  messages: ChatMessageData[];
}

export interface EditSuggestionData {
  content: string;
  author: string;
  taskId: string;
}

export interface CompletionConfirmationData {
  content: string;
  author: string;
  taskId?: string;
  type?: "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}
