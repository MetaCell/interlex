import { createContext, useState } from "react";

const GlobalDataContext = createContext();

const GlobalDataProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activeOntology, setActiveOntology] = useState(null);
  const [searchOrganizationFilters, setSearchOrganizationFilters] = useState(null);
  const [searchTypeFilter, setSearchTypeFilter] = useState(null);
  const [predicatesSingleTermState, setPredicatesSingleTermState] = useState(false);
  const [editBulkSearchFilters, setEditBulkSearchFilters] = useState([]);

  const setUserData = (userID, userActiveOrganization) => {
    setUser({ userID : userID, activeOrganization : userActiveOrganization });
  };

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

export { GlobalDataContext, GlobalDataProvider };
