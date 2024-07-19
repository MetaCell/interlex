import React, { useEffect, useRef, useState } from 'react';
import FiltersSidebar from '../Sidebar/FiltersSidebar';
import SearchResultsBox from './SearchResultsBox';
import * as mockApi from '../../api/endpoints/swaggerMockMissingEndpoints';
import termParser from '../../parsers/termParser';
import { useQuery } from '../../helpers';
import { debounce } from 'lodash';

const useMockApi = () => mockApi;

const SearchResults = () => {
    const [loading, setLoading] = useState(false);
    const [terms, setTerms] = useState({});
    const [filters, setFilters] = useState([]);
    const [checkedLabels, setCheckedLabels] = useState({});
    const query = useQuery();
    const { getMatchTerms } = useMockApi();

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

    const fetchTerms = useRef(
        debounce((searchTerm) => {
            setLoading(true);
            getMatchTerms("i")
                .then((data) => {
                    const parsedData = termParser(data, searchTerm);
                    setTerms(parsedData);
                    setFilters(parsedData.filters);
                    setLoading(false);
                })
                .catch((error) => {
                    setLoading(false);
                });
        }, 500)
    ).current;

    useEffect(() => {
        fetchTerms(searchTerm);
    }, [searchTerm, fetchTerms]);


    const filterResults = (results, checkedLabels) => {
        return results.filter(item => {
            for (let category in checkedLabels) {
                if (!checkedLabels[category]) continue; // Skip empty categories
                for (let label in checkedLabels[category]) {
                    if (checkedLabels[category][label]) {
                        const categoryLower = category.toLowerCase();
                        const itemValue = item[categoryLower] || item[categoryLower === 'type' ? 'Type' : categoryLower]; // Case-insensitive check
                        if (itemValue !== label) {
                            return false;
                        }
                    }
                }
            }
            return true;
        });
    };

    const filteredResults = filterResults(terms?.results || [], checkedLabels);

    return (
        <>
            <FiltersSidebar filters={filters} checkedLabels={checkedLabels} handleCheckboxChange={handleCheckboxChange} />
            <SearchResultsBox terms={filteredResults} searchTerm={searchTerm} loading={loading} />
        </>
    );
};

export default SearchResults;
