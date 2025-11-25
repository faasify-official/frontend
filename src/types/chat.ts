export type Message = {
  id: string
  chatId: string
  senderId: string
  senderName: string
  content: string
  createdAt: string
  readAt?: string
}

export type Chat = {
  id: string
  participants: string[] // Array of user IDs
  participantNames: string[] // Array of user names/emails
  lastMessage?: Message
  unreadCount?: number
  storeId?: string
  storeName?: string
  createdAt: string
  updatedAt: string
}

export type ChatParticipant = {
  userId: string
  name: string
  email?: string
  role?: 'buyer' | 'seller'
}
