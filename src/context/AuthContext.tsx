import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { apiPost } from '@utils/api'

export type User = {
    userId: string
    email: string
    name: string
    role: 'buyer' | 'seller'
    createdAt: string
}

type AuthContextType = {
    user: User | null
    token: string | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (name: string, email: string, password: string, role: 'buyer' | 'seller') => Promise<void>
    logout: () => void
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
        const storedToken = localStorage.getItem('authToken')
        if (storedToken) {
            setToken(storedToken)
            // Try to fetch user profile
            fetchProfile(storedToken)
        } else {
            // Development mode: Auto-login with mock user if no token exists
            // This allows testing UI without backend authentication
            if (import.meta.env.DEV) {
                const useMockAuth = localStorage.getItem('useMockAuth') !== 'false' // Default to true in dev
                if (useMockAuth) {
                    setUser(MOCK_USER)
                    setToken(MOCK_TOKEN)
                    localStorage.setItem('authToken', MOCK_TOKEN)
                    console.log('🔧 Development mode: Using mock authentication')
                }
            }
            setIsLoading(false)
        }
    }, [])

    const fetchProfile = async (authToken: string) => {
        // Skip API call for mock token in development
        if (authToken === MOCK_TOKEN) {
            setUser(MOCK_USER)
            setIsLoading(false)
            return
        }

        try {
            // We'll need to update apiGet to include auth headers
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                setUser(data.user)
            } else {
                // Token invalid, clear it
                localStorage.removeItem('authToken')
                setToken(null)
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
            // In dev mode, if API fails, fall back to mock user
            if (import.meta.env.DEV) {
                console.log('🔧 Development mode: API unavailable, using mock authentication')
                setUser(MOCK_USER)
                setToken(MOCK_TOKEN)
            } else {
                localStorage.removeItem('authToken')
                setToken(null)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (email: string, password: string) => {
        try {
            const data = await apiPost<{ user: User; token: string }>('/auth/login', {
                email,
                password,
            })

            setUser(data.user)
            setToken(data.token)
            localStorage.setItem('authToken', data.token)
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
            const data = await apiPost<{ user: User; token: string }>('/auth/register', {
                name,
                email,
                password,
                role,
            })

            setUser(data.user)
            setToken(data.token)
            localStorage.setItem('authToken', data.token)
        } catch (error: any) {
            throw new Error(error.message || 'Registration failed')
        }
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('authToken')
    }

    const value = {
        user,
        token,
        isLoading,
        login,
        register,
        logout,
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

