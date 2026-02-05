// Chat Types
export type ChatMessage = {
  _id: string
  tempId?: string  // For optimistic updates
  sender_id: string
  receiver_id: string
  message: string
  messageType: 'text'
  isRead: boolean
  createdAt: string
  updatedAt?: string
}

export type ChatConversation = {
  userId: string
  userName: string
  lastMessage: string
  unreadCount: number
  isLastMessageFromMe: boolean
  timestamp?: string
}

export type ChatEligibility = {
  canChat: boolean
  creditRequired: boolean
  alreadyInitiated: boolean
}

export type ChatHistoryResponse = {
  messages: ChatMessage[]
  hasMore: boolean
}

export type SendMessagePayload = {
  receiverId: string
  message: string
  messageType: 'text'
  tempId?: string  // For matching optimistic updates
}

export type TypingPayload = {
  receiverId: string
  isTyping: boolean
}

export type MarkAsReadPayload = {
  senderId: string
}

export type MessageSentEvent = ChatMessage & {
  creditDeducted?: boolean
  tempId?: string  // For matching optimistic updates
}

export type TypingEvent = {
  userId: string
  isTyping: boolean
}

export type UserStatusEvent = {
  userId: string
}
