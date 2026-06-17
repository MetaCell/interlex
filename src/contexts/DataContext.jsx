import PropTypes from 'prop-types';
import {createContext, useState, useEffect} from "react";
import { API_CONFIG } from '../config';

const GlobalDataContext = createContext();

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

  // Bump to signal consumers (e.g. OntologySearch) to re-fetch the ontology list.
  const refreshOntologies = () => setOntologiesRefreshKey((key) => key + 1);
  const setOntologyData = (ontology) => {
    setActiveOntology(ontology);
  };

  const setOrganizationFiltersData = (filters) => {
    setSearchOrganizationFilters(filters);
  };

  const setTypeFiltersData = (filters) => {
    setSearchTypeFilter(filters);
  };

  const setPredicatesSingleTermData = (filters) => {
    setPredicatesSingleTermState(filters);
  };

  const setEditBulkSearchData = (filters) => {
    setEditBulkSearchFilters(filters);
  };

  const setUserData = (user) => {
    setUser(user);
  }

  const updateStoredSearchTerm = (value) => {
    setStoredSearchTerm(value)
  }

  useEffect(() => {
    const userSettings = localStorage.getItem(API_CONFIG.SESSION_DATA.SETTINGS);

    if(userSettings) {
      setUser(JSON.parse(userSettings))
    }

    setLoading(false)
  }, [])

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
    loading
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
