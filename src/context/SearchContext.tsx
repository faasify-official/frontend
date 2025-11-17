import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

type SearchScope = 'storefronts' | 'items'

type StoreSummary = {
  id: string
  name: string
}

type SearchContextValue = {
  scope: SearchScope
  scopeLabel: string
  placeholder: string
  query: string
  updateQuery: (value: string) => void
  clearQuery: () => void
  registerStorefront: (store?: StoreSummary) => void
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined)

const isStorefrontRoute = (pathname: string) => {
  // Check if it's a specific storefront page (not the storefronts listing page)
  return pathname.startsWith('/storefront/') && pathname !== '/storefronts'
}

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation()
  const [queries, setQueries] = useState<Record<SearchScope, string>>({
    storefronts: '',
    items: '',
  })
  const [store, setStore] = useState<StoreSummary | undefined>()

  const scope: SearchScope = isStorefrontRoute(location.pathname) ? 'items' : 'storefronts'
  const query = queries[scope]

  const updateQuery = useCallback(
    (value: string) => {
      setQueries((prev) => ({
        ...prev,
        [scope]: value,
      }))
    },
    [scope],
  )

  const clearQuery = useCallback(() => {
    setQueries((prev) => ({
      ...prev,
      [scope]: '',
    }))
  }, [scope])

  const registerStorefront = useCallback((summary?: StoreSummary) => {
    setStore(summary)
  }, [])

  useEffect(() => {
    if (scope === 'storefronts') {
      setStore(undefined)
    }
  }, [scope])

  const placeholder =
    scope === 'storefronts'
      ? 'Search storefronts, owners, or categories'
      : store
        ? `Search ${store.name} inventory`
        : 'Search storefront items'

  const scopeLabel = scope === 'storefronts' ? 'Storefronts' : store?.name ?? 'Items'

  const value = useMemo(
    () => ({
      scope,
      scopeLabel,
      placeholder,
      query,
      updateQuery,
      clearQuery,
      registerStorefront,
    }),
    [scope, scopeLabel, placeholder, query, updateQuery, clearQuery, registerStorefront],
  )

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

export const useSearchContext = () => {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider')
  }
  return context
}

