import { useState, useEffect, useCallback, useMemo, useContext } from "react"
import { debounce } from "lodash"
import { GlobalDataContext } from "../contexts/DataContext"
import { checkPotentialMatches } from "../api/endpoints/apiService"
import { elasticSearch } from "../api/endpoints"

export const useTermSearch = ({ term, type, synonyms, isEditing, onExactMatchChange }) => {
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [lastSearch, setLastSearch] = useState({ term: "", type: "" })
  const { user } = useContext(GlobalDataContext)

  const searchFunction = useCallback(
    async (searchTerm, searchType, synonymList) => {
      if (!searchTerm || !searchType || isEditing) {
        setSearchResults([])
        return;
      }

      // Skip duplicate searches
      if (lastSearch.term === searchTerm && lastSearch.type === searchType) {
        return;
      }

      setLoading(true);

      try {
        await checkPotentialMatches(user?.groupname || "base", {
          label: searchTerm,
          "rdf-type": searchType,
          exact: synonymList,
        })

        // No exact matches found, search in elastic
        onExactMatchChange(false)
        const { results } = await elasticSearch(searchTerm, 30, 0)

        const searchResults =
          results?.results?.map((result) => ({
            ...result,
            isExactMatch: false,
          })) || []

        setSearchResults(searchResults)
      } catch (error) {
        if (error?.response?.status === 409 && error?.response?.data?.existing) {
          // Handle exact matches
          onExactMatchChange(true)
          const exactMatches = Object.entries(error.response.data.existing).flatMap(
            ([termUri, matches]) => {
              const matchList = Array.isArray(matches) ? matches : [matches]
              return matchList.map((match) => ({
                ilx: termUri.split("/").pop(),
                label: match.object ?? termUri.split("/").pop() ?? "Unknown",
                isExactMatch: true,
              }))
            },
          )
          setSearchResults(exactMatches)
        } else {
          onExactMatchChange(false)
          setSearchResults([])
        }
      } finally {
        setLoading(false)
        setLastSearch({ term: searchTerm, type: searchType })
      }
    },
    [user, onExactMatchChange, isEditing, lastSearch],
  )

  const debouncedSearch = useMemo(() => debounce(searchFunction, 500), [searchFunction])

  useEffect(() => {
    if (!term) {
      setSearchResults([])
      onExactMatchChange(false)
      return
    }

    debouncedSearch(term, type, synonyms)
    return () => debouncedSearch.cancel()
  }, [term, type, synonyms, debouncedSearch, onExactMatchChange])

  return {
    loading,
    searchResults,
    clearResults: () => setSearchResults([]),
  }
}
