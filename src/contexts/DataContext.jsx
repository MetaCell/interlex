import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import {createContext, useCallback, useEffect, useState} from "react";
import * as mockApi from "../api/endpoints/swaggerMockMissingEndpoints";

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

  const setUserData = (user) => {
    setUser(user)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchUser= useCallback(debounce(async () => {
    const data = await getUser("123");
    setUser(data)
  }, 500), [getUser]);

  useEffect(() => {
    fetchUser()
  }, [fetchUser]);

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
    setEditBulkSearchData
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
