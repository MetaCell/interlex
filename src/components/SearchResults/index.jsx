import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
import SearchResultsBox from './SearchResultsBox';
import FiltersSidebar from '../Sidebar/FiltersSidebar';
import { elasticSearch } from '../../api/endpoints';
import { parseFilterQuery, filterQuerySearch } from '../../helpers/filterQuery';

const SearchResults = () => {
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState([]);
    const [allResults, setAllResults] = useState([]);
    const [pageResults, setPageResults] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const navigate = useNavigate();
    const { pathname, search } = useLocation();
    const searchTerm = new URLSearchParams(search).get('searchTerm');

    // The URL is the only store of the checks, so a copied address bar reproduces the filtered
    // results, and a new search from the header (which writes only `searchTerm`) starts unfiltered.
    const checkedLabels = useMemo(() => parseFilterQuery(search), [search]);

    const hasActiveFilters = useMemo(() => {
        return Object.values(checkedLabels).some(category =>
            category && Object.values(category).some(Boolean)
        );
    }, [checkedLabels]);

    useEffect(() => {
        const loadAllResults = async () => {
            setLoading(true);
            try {
                const data = await elasticSearch(searchTerm);
                setFilters(data.results.filters || []);
                setAllResults(data?.results.results || []);
                setTotalItems(data?.total || 0);
                setPageResults([]);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        };
        loadAllResults();
    }, [searchTerm]);

    const loadPageData = useCallback(async (from, size) => {
        setLoading(true);
        try {
            const data = await elasticSearch(searchTerm, size, from);
            const results = data?.results.results || [];

            const filtered = hasActiveFilters ? filterResults(results, checkedLabels) : results;

            setPageResults(filtered);
        } catch (error) {
            console.error('Pagination error:', error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, checkedLabels, hasActiveFilters]);

    const fetchPage = useMemo(() => debounce(loadPageData, 500), [loadPageData]);

    const handleCheckboxChange = (category, label) => {
        const next = {
            ...checkedLabels,
            [category]: {
                ...checkedLabels[category],
                [label]: !checkedLabels[category]?.[label]
            }
        };
        navigate({ pathname, search: filterQuerySearch(search, next) }, { replace: true });

        setPageResults([]);
    };

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

    const displayedResults = hasActiveFilters
        ? filterResults(allResults, checkedLabels)
        : pageResults;

    return (
        <>
            <FiltersSidebar
                filters={filters}
                checkedLabels={checkedLabels}
                handleCheckboxChange={handleCheckboxChange}
            />
            <SearchResultsBox
                pageResults={displayedResults}
                searchTerm={searchTerm}
                loading={loading}
                totalItems={hasActiveFilters ? displayedResults.length : totalItems}
                fetchPage={fetchPage}
                checkedLabels={checkedLabels}
                hasActiveFilters={hasActiveFilters}
            />
        </>
    );
};

SearchResults.propTypes = {
    terms: PropTypes.object,
    searchTerm: PropTypes.string,
    loading: PropTypes.bool
};

export default SearchResults;
