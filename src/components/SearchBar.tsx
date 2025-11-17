import { Search, X } from 'lucide-react'
import { useSearch } from '@hooks/useSearch'
import { useId } from 'react'

const SearchBar = () => {
  const { query, placeholder, updateQuery, clearQuery, scopeLabel } = useSearch()
  const inputId = useId()

  return (
    <form
      role="search"
      aria-labelledby={`${inputId}-label`}
      onSubmit={(event) => event.preventDefault()}
      className="relative w-full max-w-xl"
    >
      <label id={`${inputId}-label`} className="sr-only" htmlFor={inputId}>
        {placeholder}
      </label>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
        <Search size={18} />
      </div>
      <input
        id={inputId}
        type="search"
        value={query}
        placeholder={placeholder}
        onChange={(event) => updateQuery(event.target.value)}
        className="h-11 w-full rounded-full border border-slate-200 bg-white pl-11 pr-20 text-sm text-charcoal transition placeholder:text-slate-400 placeholder:text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      {query && (
        <button
          type="button"
          onClick={clearQuery}
          className="absolute inset-y-0 right-12 flex items-center text-slate-400 transition hover:text-slate-600"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
      <span className="absolute inset-y-0 right-3 flex items-center">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
          {scopeLabel}
        </span>
      </span>
    </form>
  )
}

export default SearchBar

