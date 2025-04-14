import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import { useQuery } from '../../helpers';
import SearchResultsBox from './SearchResultsBox';
import { useEffect, useState, useCallback } from 'react';
import FiltersSidebar from '../Sidebar/FiltersSidebar';
import { searchAll, elasticSearch } from '../../api/endpoints';
import { SEARCH_TYPES } from '../../constants/types';


const SearchResults = () => {
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState([]);
    const [checkedLabels, setCheckedLabels] = useState({});
    const [searchResults, setSearchResults] = useState({
        terms: [],
        organizations: [],
        ontologies: []
    });
    const query = useQuery();

    const searchTerm = query.get('searchTerm');

    const handleCheckboxChange = (category, label) => {
        setCheckedLabels((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [label]: !prev[category]?.[label]
            }
        }));
        filteredResults()
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchTerms = useCallback(debounce(async (searchTerm) => {
        const data = await elasticSearch(searchTerm);
        setFilters(data.filters)
        setSearchResults({
            terms: data?.results?.filter(result => result.type === SEARCH_TYPES.TERM) || [],
            organizations: data?.results?.filter(result => result.type === SEARCH_TYPES.ORGANIZATION) || [],
            ontologies: data?.results?.filter(result => result.type === SEARCH_TYPES.ONTOLOGY) || []
        });
        setLoading(false)
    }, 500), [searchAll]);

    useEffect(() => {
        fetchTerms(searchTerm);
    }, [searchTerm, fetchTerms]);


    // const filterResults = (results, checkedLabels) => {
    //     return results.filter(item => {
    //         for (let category in checkedLabels) {
    //             if (!checkedLabels[category]) continue; // Skip empty categories
    //             for (let label in checkedLabels[category]) {
    //                 if (checkedLabels[category][label]) {
    //                     const categoryLower = category.toLowerCase();
    //                     const itemValue = item[categoryLower] || item[categoryLower === 'type' ? 'Type' : categoryLower]; // Case-insensitive check
    //                     if (itemValue !== label) {
    //                         return false;
    //                     }
    //                 }
    //             }
    //         }
    //         return true;
    //     });
    // };
    const filterResults = (results, checkedLabels, category) => {
        const arrayToFilter = results[category] || [];
        
        return arrayToFilter.filter(item => {
            for (let filterCategory in checkedLabels) {
                if (!checkedLabels[filterCategory]) continue; // Skip empty categories
                
                for (let label in checkedLabels[filterCategory]) {
                    if (checkedLabels[filterCategory][label]) {
                        const categoryLower = filterCategory.toLowerCase();
                        const itemValue = item[categoryLower] || 
                                         item[categoryLower === 'type' ? 'Type' : categoryLower]; // Case-insensitive check
                        
                        if (itemValue !== label) {
                            return false;
                        }
                    }
                }
            }
            return true;
        });
    };

    // const filteredResults = filterResults(searchResults || [], checkedLabels);
    const filteredResults = () => {
        setSearchResults({
            terms: filterResults(searchResults, checkedLabels, 'terms'),
            organizations: filterResults(searchResults, checkedLabels, 'organizations'),
            ontologies: filterResults(searchResults, checkedLabels, 'ontologies')
        });
    };

    console.log("searchResults: ", searchResults)

    return (
        <>
            <FiltersSidebar filters={filters} checkedLabels={checkedLabels} handleCheckboxChange={handleCheckboxChange} />
            <SearchResultsBox searchResults={searchResults} searchTerm={searchTerm} loading={loading} />
        </>
    );
};

SearchResults.propTypes = {
    terms: PropTypes.object,
    searchTerm: PropTypes.string,
    loading: PropTypes.bool
};

export default SearchResults;
