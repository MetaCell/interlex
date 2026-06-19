import { useState, useEffect, useCallback, useMemo, useContext } from "react"
import { debounce } from "lodash"
import { GlobalDataContext } from "../contexts/DataContext"
import { checkPotentialMatches } from "../api/endpoints/apiService"
import { elasticSearch } from "../api/endpoints"

// Check a single input value (label or synonym) for an exact match and,
// when none, its elastic potential matches.
const searchInput = async (group, value, type) => {
  try {
    await checkPotentialMatches(group, {
      label: value,
      "rdf-type": type,
      exact: [],
    })

    // No exact match from the entity check, fall back to elastic potential
    // matches. A result whose label equals the input is still an exact match.
    const { results } = await elasticSearch(value, 30, 0)
    const normalized = value.toLowerCase()
    const matches =
      results?.results?.map((result) => ({
        ...result,
        isExactMatch: result.label?.toLowerCase() === normalized,
      })) || []

    return { isExactMatch: matches.some((match) => match.isExactMatch), results: matches }
  } catch (error) {
    if (error?.response?.status === 409 && error?.response?.data?.existing) {
      const exactMatches = Object.entries(error.response.data.existing).flatMap(
        ([termUri, matches]) => {
          const matchList = Array.isArray(matches) ? matches : [matches]
          return matchList.map((match) => ({
            ilx: termUri.split("/").pop(),
            label: match.object ?? termUri.split("/").pop() ?? "Unknown",
            object: match.object ?? "",
            isExactMatch: true,
          }))
        },
      )
      return { isExactMatch: true, results: exactMatches }
    }
    return { isExactMatch: false, results: [] }
  }
}

export const useTermSearch = ({ term, type, synonyms, isEditing, onExactMatchChange }) => {
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [displayedValue, setDisplayedValue] = useState("")
  const [exactMatchValues, setExactMatchValues] = useState([])
  const { user } = useContext(GlobalDataContext)

  const reset = useCallback(() => {
    setSearchResults([])
    setExactMatchValues([])
    setDisplayedValue("")
    onExactMatchChange(false)
  }, [onExactMatchChange])

  const searchFunction = useCallback(
    async (searchTerm, searchType, synonymList) => {
      if (isEditing || !searchType) {
        reset()
        return
      }

      // Inputs in input order: label first, then synonyms as given
      const inputs = [searchTerm, ...(synonymList || [])]
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter((value) => value.length > 0)

      if (inputs.length === 0) {
        reset()
        return
      }

      setLoading(true)
      const group = user?.groupname || "base"

      try {
        const outcomes = await Promise.all(
          inputs.map((value) => searchInput(group, value, searchType)),
        )
        const perInput = inputs.map((value, index) => ({ value, ...outcomes[index] }))

        const exactInputs = perInput.filter((input) => input.isExactMatch)
        setExactMatchValues(exactInputs.map((input) => input.value))

        if (exactInputs.length > 0) {
          // An exact match takes precedence (label wins, then first synonym)
          const chosen = exactInputs[0]
          onExactMatchChange(true)
          setSearchResults(chosen.results)
          setDisplayedValue(chosen.value)
          return
        }

        // No exact match: show the last input that returned results
        onExactMatchChange(false)
        const chosen = [...perInput].reverse().find((input) => input.results.length > 0)
        setSearchResults(chosen ? chosen.results : [])
        setDisplayedValue(chosen ? chosen.value : inputs[inputs.length - 1])
      } finally {
        setLoading(false)
      }
    },
    [user, onExactMatchChange, isEditing, reset],
  )

  const debouncedSearch = useMemo(() => debounce(searchFunction, 500), [searchFunction])

  useEffect(() => {
    debouncedSearch(term, type, synonyms)
    return () => debouncedSearch.cancel()
  }, [term, type, synonyms, debouncedSearch])

  return {
    loading,
    searchResults,
    displayedValue,
    exactMatchValues,
    clearResults: () => setSearchResults([]),
  }
}
