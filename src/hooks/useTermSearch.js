import { useState, useEffect, useCallback, useMemo, useContext, useRef } from "react"
import { debounce } from "lodash"
import { GlobalDataContext } from "../contexts/DataContext"
import { checkPotentialMatches } from "../api/endpoints/apiService"
import { elasticSearch } from "../api/endpoints"

export const useTermSearch = ({ term, type, synonyms, isEditing, onExactMatchChange }) => {
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [synonymValidationStatus, setSynonymValidationStatus] = useState({})
  const { user } = useContext(GlobalDataContext)
  const checkedSynonymsRef = useRef(new Set())

    const checkSynonym = useCallback(async (synonym, searchType) => {
    try {
      await checkPotentialMatches(user?.groupname || "base", {
        label: synonym,
        "rdf-type": searchType,
        exact: [synonym],
      })
      return false // No match found
    } catch (error) {
      if (error?.response?.status === 409) {
        return true // Match found
      }
      return false
    }
  }, [user?.groupname])

  const searchTerm = useCallback(async (searchTerm, searchType) => {
    if (!searchTerm || !searchType || isEditing) {
      setSearchResults([])
      return
    }

    setLoading(true)

    try {
      await checkPotentialMatches(user?.groupname || "base", {
        label: searchTerm,
        "rdf-type": searchType,
        exact: [searchTerm], // Only check the main term, not synonyms
      })

      onExactMatchChange(false)
      const { results } = await elasticSearch(searchTerm, 30, 0)
      const searchResults = results?.results?.map((result) => ({
        ...result,
        isExactMatch: false,
      })) || []

      setSearchResults(searchResults)
    } catch (error) {
      if (error?.response?.status === 409 && error?.response?.data?.existing) {
        onExactMatchChange(true)
        const exactMatches = Object.entries(error.response.data.existing).flatMap(
          ([termUri, matches]) => {
            const matchList = Array.isArray(matches) ? matches : [matches]
            return matchList.map((match) => ({
              ilx: termUri.split("/").pop(),
              label: match.object ?? termUri.split("/").pop() ?? "Unknown",
              isExactMatch: true,
            }))
          }
        )
        setSearchResults(exactMatches)
      } else {
        onExactMatchChange(false)
        setSearchResults([])
      }
    } finally {
      setLoading(false)
    }
  }, [user?.groupname, onExactMatchChange, isEditing])

  const validateSynonym = useCallback(async (synonym, searchType) => {
    if (!synonym || !searchType) return
    
    checkedSynonymsRef.current.add(synonym)
    try {
      const hasMatch = await checkSynonym(synonym, searchType)
      setSynonymValidationStatus(prev => ({
        ...prev,
        [synonym]: { hasMatch }
      }))
    } catch (error) {
      console.error('Error checking synonym:', error)
      setSynonymValidationStatus(prev => ({
        ...prev,
        [synonym]: { hasMatch: false }
      }))
    }
  }, [checkSynonym])

  const debouncedSearchTerm = useMemo(() => debounce(searchTerm, 500), [searchTerm])
  const debouncedValidateSynonym = useMemo(() => debounce(validateSynonym, 500), [validateSynonym])

  useEffect(() => {
    if (!term) {
      setSearchResults([])
      onExactMatchChange(false)
      return
    }

    debouncedSearchTerm(term, type)
    return () => debouncedSearchTerm.cancel()
  }, [term, type, debouncedSearchTerm, onExactMatchChange])

  useEffect(() => {
    if (!synonyms?.length || !type) return

    synonyms.forEach(synonym => {
      if (synonym && !checkedSynonymsRef.current.has(synonym)) {
        debouncedValidateSynonym(synonym, type)
      }
    })
  }, [synonyms, type, debouncedValidateSynonym])

  useEffect(() => {
    return () => {
      debouncedSearchTerm.cancel()
      debouncedValidateSynonym.cancel()
    }
  }, [debouncedSearchTerm, debouncedValidateSynonym])

  const getSynonymStatus = useCallback((synonym) => {
    return synonymValidationStatus[synonym] || { hasMatch: false }
  }, [synonymValidationStatus])

  const clearSynonymValidation = useCallback((synonym) => {
    setSynonymValidationStatus(prev => {
      const newStatus = { ...prev }
      delete newStatus[synonym]
      return newStatus
    })
    checkedSynonymsRef.current.delete(synonym)
  }, [])

  const hasAnySynonymMatch = useMemo(() => {
    return Object.values(synonymValidationStatus).some(status => status.hasMatch)
  }, [synonymValidationStatus])

  return {
    loading,
    searchResults,
    getSynonymStatus,
    clearSynonymValidation,
    hasAnySynonymMatch,
  }
}
