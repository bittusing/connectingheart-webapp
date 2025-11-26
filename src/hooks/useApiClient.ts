import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { showToast } from '../utils/toast'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type RequestConfig = Omit<RequestInit, 'method'>

/**
 * Lightweight API client hook to keep networking concerns outside UI components.
 */
export const useApiClient = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3856'
  const navigate = useNavigate()
  const request = useCallback(
    async <TResponse>(
      path: string,
      init: RequestInit = {},
    ): Promise<TResponse> => {
      // Get auth token from localStorage
      const token = window.localStorage.getItem('connectingheart-token')
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(init.headers as Record<string, string>),
      }
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      // Ensure path starts with / for proper URL construction
      const normalizedPath = path.startsWith('/') ? path : `${path}`
      const response = await fetch(`${baseUrl}${normalizedPath}`, {
        ...init,
        headers,
      })

      if (!response.ok) {
        let errorMessage = response.statusText || 'Unknown error'
        
        // Try to read error response as JSON first, then fallback to text
        const contentType = response.headers.get('content-type')
        const isJson = contentType?.includes('application/json')
        try {
          if (isJson) {
            const errorPayload = await response.json()
            console.log("errorPayload",errorPayload);
            // Handle structured error responses
            if (errorPayload.message) {
              errorMessage = errorPayload.message
            }
            else if((errorPayload.err as any)?.redirectToMembership) {
              const membershipMessage = errorPayload.err?.msg || 'Please renew your membership in order to unlock further profiles.'
              showToast(membershipMessage, 'error')
              errorMessage = membershipMessage
              setTimeout(() => {
                navigate('/dashboard/membership')
              }, 500)
            }
            else if (errorPayload.err?.msg) {
              errorMessage = errorPayload.err.msg
            } else if (errorPayload.error) {
              errorMessage = errorPayload.error
            } else if (typeof errorPayload === 'string') {
              errorMessage = errorPayload
            }
          } else {
            const errorText = await response.text()
            if (errorText) {
              errorMessage = errorText
            }
          }
        } catch {
          // If parsing fails, use default error message
        }
        
        throw new Error(`API ${response.status}: ${errorMessage}`)
      }

      if (response.status === 204) {
        return undefined as TResponse
      }

      return (await response.json()) as TResponse
    },
    [baseUrl],
  )

  const withBody = useCallback(
    async <TBody, TResponse>(
      method: HttpMethod,
      path: string,
      body: TBody,
      config?: RequestConfig,
    ) => {
      return request<TResponse>(path, {
        method,
        body: JSON.stringify(body),
        ...config,
      })
    },
    [request],
  )

  const get = useCallback(
    <TResponse>(path: string, config?: RequestConfig) =>
      request<TResponse>(path, { method: 'GET', ...config }),
    [request],
  )

  const post = useCallback(
    <TBody, TResponse>(path: string, body: TBody, config?: RequestConfig) =>
      withBody<TBody, TResponse>('POST', path, body, config),
    [withBody],
  )

  const put = useCallback(
    <TBody, TResponse>(path: string, body: TBody, config?: RequestConfig) =>
      withBody<TBody, TResponse>('PUT', path, body, config),
    [withBody],
  )

  const patch = useCallback(
    <TBody, TResponse>(path: string, body: TBody, config?: RequestConfig) =>
      withBody<TBody, TResponse>('PATCH', path, body, config),
    [withBody],
  )

  const remove = useCallback(
    <TResponse>(path: string, config?: RequestConfig) =>
      request<TResponse>(path, { method: 'DELETE', ...config }),
    [request],
  )

  return {
    get,
    post,
    put,
    patch,
    delete: remove,
  }
}

export type ApiClient = ReturnType<typeof useApiClient>

