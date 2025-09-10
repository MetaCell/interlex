import { useState, useEffect, useCallback, useRef } from 'react';
import { getSelectedTermLabel } from '../api/endpoints/apiService';

// Cache to store term data and avoid duplicate API calls
const termDataCache = new Map();

export const useTermData = (searchTerm, group) => {
  const [termData, setTermData] = useState(null);
  const [actualGroup, setActualGroup] = useState(group);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [isLoadingTerm, setIsLoadingTerm] = useState(false);
  const abortControllerRef = useRef(null);

  const fetchTermData = useCallback(async (term, groupName) => {
    if (!term || !groupName) return;

    // Create cache key
    const cacheKey = `${groupName}:${term}`;
    
    // Check cache first
    if (termDataCache.has(cacheKey)) {
      const cachedData = termDataCache.get(cacheKey);
      setTermData(cachedData.label);
      setActualGroup(cachedData.actualGroup);
      setIsUsingFallback(cachedData.actualGroup !== groupName);
      return;
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    setIsLoadingTerm(true);
    try {
      const result = await getSelectedTermLabel(term, groupName);
      
      // Cache the result
      termDataCache.set(cacheKey, result);
      
      setTermData(result.label);
      setActualGroup(result.actualGroup);
      setIsUsingFallback(result.actualGroup !== groupName);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching term data:', error);
      }
    } finally {
      setIsLoadingTerm(false);
      abortControllerRef.current = null;
    }
  }, []);

  useEffect(() => {
    fetchTermData(searchTerm, group);

    // Cleanup function to abort request if component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchTerm, group, fetchTermData]);

  return {
    termData,
    actualGroup,
    isUsingFallback,
    isLoadingTerm,
    refreshTermData: () => {
      // Clear cache for this term and refetch
      const cacheKey = `${group}:${searchTerm}`;
      termDataCache.delete(cacheKey);
      fetchTermData(searchTerm, group);
    }
  };
};

// Utility function to clear the entire cache if needed
export const clearTermDataCache = () => {
  termDataCache.clear();
};
