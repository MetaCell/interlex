import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import { useQuery } from '../../helpers';
import SearchResultsBox from './SearchResultsBox';
import { useEffect, useState, useCallback } from 'react';
import FiltersSidebar from '../Sidebar/FiltersSidebar';
import { searchAll, elasticSearch } from '../../api/endpoints';


const SearchResults = () => {
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState([]);
    const [checkedLabels, setCheckedLabels] = useState({});
    const [searchResults, setSearchResults] = useState([]);
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
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchTerms = useCallback(debounce(async (searchTerm) => {
        const data = await elasticSearch(searchTerm);
        setFilters(data.filters)
        setSearchResults(data?.results || []);
        setLoading(false)
    }, 500), [searchAll]);

    useEffect(() => {
        fetchTerms(searchTerm);
    }, [searchTerm, fetchTerms]);


    const filterResults = (results, checkedLabels) => {
        return results.filter(item => {
            for (let category in checkedLabels) {
                if (!checkedLabels[category]) continue; // Skip empty categories

                const selectedLabels = Object.entries(checkedLabels[category])
                    .filter(([, isChecked]) => isChecked)
                    .map(([label]) => label);

                if (selectedLabels.length === 0) continue;

                const categoryLower = category.toLowerCase();
                const itemValue = item[categoryLower] || item[categoryLower === 'type' ? 'Type' : categoryLower];

                if (!selectedLabels.includes(itemValue)) {
                    return false;
                }
            }
            return true;
        });
    };

    const filteredResults = filterResults(searchResults || [], checkedLabels);

    return (
        <>
            <FiltersSidebar filters={filters} checkedLabels={checkedLabels} handleCheckboxChange={handleCheckboxChange} />
            <SearchResultsBox searchResults={filteredResults} searchTerm={searchTerm} loading={loading} />
        </>
    );
};

SearchResults.propTypes = {
    terms: PropTypes.object,
    searchTerm: PropTypes.string,
    loading: PropTypes.bool
};

export default SearchResults;
