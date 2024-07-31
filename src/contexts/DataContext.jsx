import {createContext, useCallback, useEffect, useState} from "react";
import * as mockApi from "../api/endpoints/swaggerMockMissingEndpoints";
import { debounce } from 'lodash';

const useMockApi = () => mockApi;

const GlobalDataContext = createContext();
const GlobalDataProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activeOntology, setActiveOntology] = useState(null);
  const [searchOrganizationFilters, setSearchOrganizationFilters] = useState(null);
  const [searchTypeFilter, setSearchTypeFilter] = useState(null);
  const [predicatesSingleTermState, setPredicatesSingleTermState] = useState(false);
  const [editBulkSearchFilters, setEditBulkSearchFilters] = useState([]);
  const {  getUser } = useMockApi();
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
  
  
  const fetchUser= useCallback(debounce(async () => {
    const data = await getUser("123");
    setUser(data)
  }, 500), [getUser]);
  
  useEffect(() => {
    fetchUser()
  }, []);

  const dataContextValue = {
    user,
    activeOntology,
    setOntologyData,
    searchOrganizationFilters,
    setOrganizationFiltersData,
    searchTypeFilter,
    setTypeFiltersData,
    predicatesSingleTermState,
    setPredicatesSingleTermData,
    editBulkSearchFilters,
    setEditBulkSearchData
  };

  return (
    <GlobalDataContext.Provider value={dataContextValue}>
      {children}
    </GlobalDataContext.Provider>
  );
};

export { GlobalDataContext, GlobalDataProvider };
