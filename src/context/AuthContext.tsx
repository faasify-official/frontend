import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { apiPost } from '@utils/api'
import { setAuthTokens, clearAuthTokens, getAuthTokens } from '@utils/api'

export type User = {
    userId: string
    email: string
    name: string
    role: 'buyer' | 'seller'
    hasStorefront?: boolean
    createdAt: string
}

type AuthContextType = {
    user: User | null
    token: string | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (name: string, email: string, password: string, role: 'buyer' | 'seller') => Promise<void>
    logout: () => void
    refreshProfile: () => Promise<void>
    isAuthenticated: boolean
    isSeller: boolean
    isBuyer: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type Props = {
    children: ReactNode
}

// Mock user for development (when backend auth is not available)
const MOCK_USER: User = {
    userId: 'mock-user-123',
    email: 'dev@faasify.com',
    name: 'Dev User',
    role: 'buyer',
    createdAt: new Date().toISOString(),
}

const MOCK_TOKEN = 'mock-dev-token'

export const AuthProvider = ({ children }: Props) => {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Load token and user from localStorage on mount
    useEffect(() => {
        const initializeAuth = async () => {
            const storedTokens = getAuthTokens()
            if (storedTokens?.idToken) {
                setToken(storedTokens.idToken)
                // Fetch user profile and wait for it to complete
                await fetchProfile(storedTokens.idToken)
            } else {
                // Development mode: Auto-login with mock user if no token exists
                if (import.meta.env.DEV) {
                    const useMockAuth = localStorage.getItem('useMockAuth') !== 'false' // Default to true in dev
                    if (useMockAuth) {
                        setUser(MOCK_USER)
                        setToken(MOCK_TOKEN)
                        console.log('🔧 Development mode: Using mock authentication')
                    }
                }
                setIsLoading(false)
            }
        }
        initializeAuth()
    }, [])

    const fetchProfile = async (authToken: string) => {
        // Skip API call for mock token in development
        if (authToken === MOCK_TOKEN) {
            setUser(MOCK_USER)
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                console.log('✓ Profile fetched successfully:', data.user)
                setUser(data.user)
                setIsLoading(false)
            } else {
                console.error('Profile fetch failed with status:', response.status)
                const error = await response.json().catch(() => ({}))
                console.error('Error response:', error)
                // Token invalid, clear it
                clearAuthTokens()
                setToken(null)
                setUser(null)
                setIsLoading(false)
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
            // If API call fails, don't assume it's invalid - could be network issue
            // In dev mode, fall back to mock user
            if (import.meta.env.DEV) {
                console.log('🔧 Development mode: API unavailable, using mock authentication')
                setUser(MOCK_USER)
                setToken(MOCK_TOKEN)
            } else {
                clearAuthTokens()
                setToken(null)
                setUser(null)
            }
            setIsLoading(false)
        }
    }

    const login = async (email: string, password: string) => {
        try {
            const data = await apiPost<{
                user: User
                tokens: { idToken: string; accessToken: string; refreshToken: string }
            }>('/auth/login', {
                email,
                password,
            })

            setUser(data.user)
            setToken(data.tokens.idToken)
            setAuthTokens(data.tokens)
        } catch (error: any) {
            throw new Error(error.message || 'Login failed')
        }
    }

    const register = async (
        name: string,
        email: string,
        password: string,
        role: 'buyer' | 'seller'
    ) => {
        try {
            const data = await apiPost<{ user: User }>('/auth/register', {
                name,
                email,
                password,
                role,
            })

            setUser(data.user)
            // After registration, user needs to log in to get tokens
            // This is handled by the component redirecting to login
        } catch (error: any) {
            throw new Error(error.message || 'Registration failed')
        }
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        clearAuthTokens()
    }

    const refreshProfile = async () => {
        const storedTokens = getAuthTokens()
        if (storedTokens?.idToken) {
            await fetchProfile(storedTokens.idToken)
        }
    }

    const value = {
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        isAuthenticated: !!user && !!token,
        isSeller: user?.role === 'seller',
        isBuyer: user?.role === 'buyer',
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

