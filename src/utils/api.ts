/**
 * API utility functions for making requests to the backend
 * Uses VITE_API_URL from environment variables
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * Gets the auth token from localStorage
 * With Cognito, we store tokens as a JSON object with idToken, accessToken, refreshToken
 */
const getAuthToken = (): string | null => {
  try {
    const tokenData = localStorage.getItem('authTokens')
    if (tokenData) {
      const parsed = JSON.parse(tokenData)
      // Return idToken for API requests (contains claims and user info)
      return parsed.idToken || null
    }
  } catch (e) {
    // Fall back to old single token format for backwards compatibility
    return localStorage.getItem('authToken')
  }
  return null
}

/**
 * Gets ALL (3) auth tokens (including refresh token)
 */
export const getAuthTokens = () => {
  try {
    const tokenData = localStorage.getItem('authTokens')
    if (tokenData) {
      return JSON.parse(tokenData)
    }
  } catch (e) {
    console.error('Error parsing auth tokens:', e)
  }
  return null
}

/**
 * Stores auth tokens from Cognito
 */
export const setAuthTokens = (tokens: { idToken: string; accessToken: string; refreshToken: string }) => {
  localStorage.setItem('authTokens', JSON.stringify(tokens))
}

/**
 * Clears auth tokens
 */
export const clearAuthTokens = () => {
  localStorage.removeItem('authTokens')
  localStorage.removeItem('authToken') // Clear old format too
}

/**
 * Makes a fetch request to the API
 * @param endpoint - API endpoint (e.g., '/listings', '/cart')
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns Promise with the response
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  const token = getAuthToken()
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(errorData.error || `API request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * GET request helper
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET' })
}

/**
 * POST request helper
 */
export async function apiPost<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * PUT request helper
 */
export async function apiPut<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * DELETE request helper
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE' })
}

