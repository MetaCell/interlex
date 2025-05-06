import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
import { useQuery } from '../../helpers';
import SearchResultsBox from './SearchResultsBox';
import FiltersSidebar from '../Sidebar/FiltersSidebar';
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

    useEffect(() => {
        const loadAllResults = async () => {
            setLoading(true);
            try {
                const data = await elasticSearch(searchTerm, 20, 0);
                setFilters(data.results.filters || []);
                setAllResults(data?.results.results || []);
                setTotalItems(data?.total || 0);
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
            setPageResults(data?.results.results || []);
        } catch (error) {
            console.error('Pagination error:', error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    const fetchPage = useMemo(() => debounce(loadPageData, 500), [loadPageData]);

    const handleCheckboxChange = (category, label) => {
        setCheckedLabels(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [label]: !prev[category]?.[label]
            }
        }));
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

    const filteredResults = filterResults(pageResults || [], checkedLabels);

    console.log("totalItems: ", totalItems)

    return (
        <>
            <FiltersSidebar
                filters={filters}
                checkedLabels={checkedLabels}
                handleCheckboxChange={handleCheckboxChange}
            />
            <SearchResultsBox
                allResults={allResults}
                pageResults={filteredResults}
                searchTerm={searchTerm}
                loading={loading}
                totalItems={totalItems}
                fetchPage={fetchPage}
                checkedLabels={checkedLabels}
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
