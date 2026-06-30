import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
import { useQuery } from '../../helpers';
import SearchResultsBox from './SearchResultsBox';
import FiltersSidebar from '../Sidebar/FiltersSidebar';
import ApiErrorDialog from '../common/ApiErrorDialog';
import { elasticSearch } from '../../api/endpoints';

const SearchResults = () => {
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState([]);
    const [checkedLabels, setCheckedLabels] = useState({});
    const [allResults, setAllResults] = useState([]);
    const [pageResults, setPageResults] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const query = useQuery();
    const searchTerm = query.get('searchTerm');

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
        setCheckedLabels(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [label]: !prev[category]?.[label]
            }
        }));

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
            <ApiErrorDialog />
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
