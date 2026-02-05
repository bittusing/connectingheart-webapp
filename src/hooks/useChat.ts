import { useState, useCallback } from 'react'
import { useApiClient } from './useApiClient'
import type { ChatEligibility, ChatConversation, ChatHistoryResponse } from '../types/chat'

const CHAT_BASE_URL = '/chat'

export const useChat = () => {
  const { get } = useApiClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkEligibility = useCallback(async (receiverId: string): Promise<ChatEligibility | null> => {
    setLoading(true)
    setError(null)
    try {
      const response = await get<{ data: ChatEligibility }>(`${CHAT_BASE_URL}/checkEligibility/${receiverId}`)
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check eligibility'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [get])

  const getChatList = useCallback(async (): Promise<ChatConversation[]> => {
    setLoading(true)
    setError(null)
    try {
      const response = await get<{ data: ChatConversation[] }>(`${CHAT_BASE_URL}/list`)
      return response.data || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load chat list'
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }, [get])

  const getChatHistory = useCallback(async (
    otherUserId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<ChatHistoryResponse | null> => {
    setLoading(true)
    setError(null)
    try {
      const response = await get<{ data: ChatHistoryResponse }>(
        `${CHAT_BASE_URL}/history/${otherUserId}?page=${page}&limit=${limit}`
      )
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load chat history'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [get])

  const getUnreadCount = useCallback(async (): Promise<number> => {
    try {
      const response = await get<{ data: { unreadCount: number } }>(`${CHAT_BASE_URL}/unreadCount`)
      return response.data.unreadCount || 0
    } catch (err) {
      console.error('Failed to get unread count:', err)
      return 0
    }
  }, [get])

  return {
    checkEligibility,
    getChatList,
    getChatHistory,
    getUnreadCount,
    loading,
    error
  }
}
