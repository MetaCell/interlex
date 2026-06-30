import PropTypes from 'prop-types';
import { createContext, useState, useEffect, useRef } from "react";
import { API_CONFIG } from '../config';
import { getOrganizationsCuries } from '../api/endpoints/apiService';

const GlobalDataContext = createContext();

const transformCuriesResponse = (response) => {
  let curiesObject;
  if (Array.isArray(response) && response.length > 0) {
    curiesObject = response[0];
  } else if (response && typeof response === 'object') {
    curiesObject = response;
  }
  if (curiesObject && Object.keys(curiesObject).length > 0) {
    return Object.entries(curiesObject).map(([prefix, namespace]) => ({
      prefix,
      namespace,
      _id: `existing_${prefix}_${namespace}`
    }));
  }
  return [];
};

const GlobalDataProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activeOntology, setActiveOntology] = useState(null);
  const [searchOrganizationFilters, setSearchOrganizationFilters] = useState(null);
  const [searchTypeFilter, setSearchTypeFilter] = useState(null);
  const [predicatesSingleTermState, setPredicatesSingleTermState] = useState(false);
  const [editBulkSearchFilters, setEditBulkSearchFilters] = useState([]);
  const [storedSearchTerm, setStoredSearchTerm] = useState("");
  const [ontologiesRefreshKey, setOntologiesRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [curies, setCuries] = useState({ base: [], curated: [], latest: [] });
  const [curiesLoading, setCuriesLoading] = useState(true);
  const userCuriesLoaded = useRef(false);

  const refreshOntologies = () => setOntologiesRefreshKey((key) => key + 1);
  const setOntologyData = (ontology) => setActiveOntology(ontology);
  const setOrganizationFiltersData = (filters) => setSearchOrganizationFilters(filters);
  const setTypeFiltersData = (filters) => setSearchTypeFilter(filters);
  const setPredicatesSingleTermData = (filters) => setPredicatesSingleTermState(filters);
  const setEditBulkSearchData = (filters) => setEditBulkSearchFilters(filters);
  const setUserData = (user) => setUser(user);
  const updateStoredSearchTerm = (value) => setStoredSearchTerm(value);
  const setCuriesData = (newCuries) => setCuries(newCuries);

  useEffect(() => {
    const userSettings = localStorage.getItem(API_CONFIG.SESSION_DATA.SETTINGS);
    if (userSettings) {
      setUser(JSON.parse(userSettings));
    }
    setLoading(false);
  }, []);

  // Fetch /base/curies once — populates Curated + Latest, and "My curies" fallback when unauthenticated
  useEffect(() => {
    let cancelled = false;
    setCuriesLoading(true);
    getOrganizationsCuries('base')
      .catch(err => err?.response?.status === 501 ? [{}] : Promise.reject(err))
      .then(r => {
        if (cancelled) return;
        const data = transformCuriesResponse(r);
        setCuries(prev => ({
          base: userCuriesLoaded.current ? prev.base : data,
          curated: data,
          latest: data
        }));
      })
      .catch(err => console.error('Error fetching base curies:', err))
      .finally(() => { if (!cancelled) setCuriesLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Fetch user's own curies when authenticated
  useEffect(() => {
    if (!user?.groupname) return;
    let cancelled = false;
    getOrganizationsCuries(user.groupname)
      .catch(err => err?.response?.status === 501 ? [{}] : Promise.reject(err))
      .then(r => {
        if (cancelled) return;
        userCuriesLoaded.current = true;
        setCuries(prev => ({ ...prev, base: transformCuriesResponse(r) }));
      })
      .catch(err => console.error('Error fetching user curies:', err));
    return () => { cancelled = true; };
  }, [user?.groupname]);

  const dataContextValue = {
    user,
    setUserData,
    activeOntology,
    setOntologyData,
    searchOrganizationFilters,
    setOrganizationFiltersData,
    searchTypeFilter,
    setTypeFiltersData,
    predicatesSingleTermState,
    setPredicatesSingleTermData,
    editBulkSearchFilters,
    setEditBulkSearchData,
    storedSearchTerm,
    updateStoredSearchTerm,
    ontologiesRefreshKey,
    refreshOntologies,
    loading,
    curies,
    curiesLoading,
    setCuriesData,
  };

  return (
    <GlobalDataContext.Provider value={dataContextValue}>
      {children}
    </GlobalDataContext.Provider>
  );
};

GlobalDataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { GlobalDataContext, GlobalDataProvider };
