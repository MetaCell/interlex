import { API_CONFIG } from "./../../config.js";
import axios from "axios";
import * as mockApi from "./../../api/endpoints/swaggerMockMissingEndpoints";
import * as api from "./../../api/endpoints/interLexURIStructureAPI";
import termParser, { elasticSearhParser, getTerm } from "../../parsers/termParser";
import curieParser from "../../parsers/curieParser";

const useMockApi = () => mockApi;
const useApi = () => api;

const fetchData = async (url, method = "GET", data = null) => {
    try {
        const response = await axios({
            url,
            method,
            data,
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        console.error(`API Error at ${url}:`, error);
        throw error;
    }
};

export const getOrganizations = async () => fetchData(API_CONFIG.MOCK_API.GET_ORGANIZATIONS);
export const getOrganization = async (id) => fetchData(`${API_CONFIG.MOCK_API.GET_ORGANIZATION}/${id}`);
export const getOrganizationTerms = async (id) => fetchData(`${API_CONFIG.MOCK_API.GET_ORGANIZATION_TERMS}/${id}`).then(data => termParser(data, undefined));
export const getOrganizationCuries = async (id) => fetchData(`${API_CONFIG.MOCK_API.GET_ORGANIZATION_CURIES}/${id}`).then(curieParser);
export const getOrganizationOntologies = async (id) => fetchData(`${API_CONFIG.MOCK_API.GET_ORGANIZATION_ONTOLOGIES}/${id}`);
export const getVariants = async (group, term) => fetchData(`${API_CONFIG.MOCK_API.GET_VARIANTS}/${group}/${term}`);
export const getVersions = async (group, term) => fetchData(`${API_CONFIG.MOCK_API.GET_VERSIONS}/${group}/${term}`);
export const getCuries = async (term) => fetchData(`${API_CONFIG.MOCK_API.GET_CURIES}/${term}`).then(curieParser);
export const searchAll = async (term, filters = {}) => fetchData(API_CONFIG.MOCK_API.SEARCH_ALL, "POST", { term, filters }).then(data => {
    let terms = termParser(data.terms, term, filters);
    terms?.results?.forEach(result => result.type = "TERM");
    data.organizations?.forEach(org => org.type = "ORGANIZATION");
    data.ontologies?.forEach(ontology => ontology.type = "ONTOLOGY");
    return { ...terms, results: [...terms.results, ...data.organizations, ...data.ontologies] };
});
export const patchTerm = async (group, termID) => fetchData(`${API_CONFIG.REAL_API.PATCH_ENDPOINTS_ILX}/${group}/${termID}`, "PATCH").then(data => ({
    status: data.status,
    term: getTerm(data.data),
}));
export const addTerm = async (group, term) => fetchData(`${API_CONFIG.MOCK_API.ADD_TERM}/${group}`, "POST", term).then(data => ({
    status: data.status,
    term: getTerm(data.data),
}));
export const bulkEditTerms = async (group, payload) => fetchData(`${API_CONFIG.MOCK_API.BULK_EDIT_TERMS}/${group}`, "PATCH", payload).then(data => ({
    status: data.status,
    terms: termParser(data.data, undefined),
}));
export const getUser = async (id) => fetchData(`${API_CONFIG.MOCK_API.GET_USER}/${id}`);
export const getExistingIDs = async () => fetchData(API_CONFIG.MOCK_API.GET_EXISTING_IDS).then(data => {
    const terms = termParser(data, undefined);
    return terms?.results?.[0]?.id ? terms.results.map(term => term.id?.split("/").pop()) : [];
});
export const signup = async (body) => fetchData(API_CONFIG.MOCK_API.SIGNUP, "POST", body);
export const getVariantDiscussions = async (group, variantID) => fetchData(`${API_CONFIG.MOCK_API.GET_VARIANT_DISCUSSIONS}/${group}/${variantID}`);
export const getTermDiscussions = async (group, termID) => fetchData(`${API_CONFIG.MOCK_API.GET_TERM_DISCUSSIONS}/${group}/${termID}`);
export const addMessageToTermDiscussion = async (group, termID, message) => fetchData(`${API_CONFIG.MOCK_API.ADD_TO_TERM_DISCUSSION}/${group}/${termID}`, "POST", message);
export const addMessageToVariantDiscussion = async (group, variantID, message) => fetchData(`${API_CONFIG.MOCK_API.ADD_TO_VARIANT_DISCUSSION}/${group}/${variantID}`, "POST", message);
export const getMatchTerms = async (term, filters = {}) => fetchData(API_CONFIG.PROXY.MATCH_TERMS, "POST", { group: "base", term, type: "jsonld" }).then(data => termParser(data, term, filters));
export const elasticSearch = async (query) => fetchData(API_CONFIG.PROXY.ELASTIC_SEARCH, "POST", { query }).then(data => elasticSearhParser(data?.data?.hits?.hits));