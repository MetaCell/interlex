import { Term, Terms } from "./../model/frontend/terms";
import { termKeys, termPredicates } from "../configuration/model";
import { defaultTermFiltersSections } from "../configuration/filters";

/**
 * Takes in raw term data object from server and formats it into Term object 
 * that the client can use. 
 * 
 * @param data - Raw term data object received from server
 * @returns - Term
 */
export const getTerm = (data) => {
    let term: Term = {} as Term;
    let predicates = {};
    let isAboutValue = null;

    data?.["@graph"]?.forEach((object) => {
        if (object["isAbout"]) {
            isAboutValue = object["isAbout"]?.["@id"] || object["isAbout"];
        }
    });

    let matchedObject = null;
    data?.["@graph"]?.forEach((object) => {
        if (object["@id"] === isAboutValue && object["@type"] === "owl:Class") {
            matchedObject = object;
        }
    });

    const keys = Object.keys(matchedObject);
    keys.forEach((key) => {
        const predicate = key;
        if (termPredicates[predicate]) {
            let value = matchedObject[key];
            let dataToStore = value;

            if (value?.["@id"]) {
                dataToStore = value?.["@id"];
            }

            if (Array.isArray(value)) {
                dataToStore = [];
                value?.forEach((v) => {
                    if (v?.["@id"]) {
                        dataToStore = [...dataToStore, v?.["@id"]];
                    } else {
                        dataToStore = [...dataToStore, v];
                    }
                });
            }

            if (term[termPredicates[predicate]?.key] === undefined) {
                term[termPredicates[predicate]?.key] = dataToStore;
            }

            // Organize predicates from triple
            if (Array.isArray(dataToStore)) {
                dataToStore?.forEach((pred) => {
                    let newPredicate = {
                        subject: matchedObject["@id"],
                        predicate: predicate,
                        object: pred,
                    };
                    predicates[predicate]
                        ? predicates[predicate].push(newPredicate)
                        : (predicates[predicate] = [newPredicate]);
                });
            } else {
                let newPredicate = {
                    subject: matchedObject["@id"],
                    predicate: predicate,
                    object: dataToStore,
                };
                predicates[predicate]
                    ? predicates[predicate].push(newPredicate)
                    : (predicates[predicate] = [newPredicate]);
            }
        }
    });

    let predicatesFormatted = [];
    Object.keys(predicates)?.forEach((key) => {
        predicatesFormatted.push({
            title: key,
            count: predicates[key]?.length,
            tableData: predicates[key],
        });
    });

    term.predicates = predicatesFormatted;

    return term;
};

/** Return results between two indeces */
const indexRange = (arr, start?, end?) => {
    return start && end ? arr.slice(start, end) : arr;
}

/** Format terms and return array between two indeces */
const formatTerms = (terms, searchTerm, start?, end?) => {
    return indexRange(terms, start, end);
}

const getFilters = ( terms ) => {
    let filters = {};
    const filtersKeys = Object.keys(defaultTermFiltersSections);
    filtersKeys?.forEach( key => {
        filters[key] = {};
    })

    terms.forEach( term => {
        filtersKeys?.forEach( key => {
            if ( term[termPredicates[defaultTermFiltersSections[key]]?.key] != undefined ) {
                const label = term[termPredicates[defaultTermFiltersSections[key]]?.key];
                const id = term.id;
                let newFilter = { [label] :{
                    "label" : label,
                    "ids" : filters[key]?.[label] ? filters[key]?.[label]?.ids.concat(id) : [id]
                }}
                filters[key] = { ...filters[key], ...newFilter }
            }
        })
        
    })

    return filters;
}

/**
 * 
 * @param data - Data returned from server
 * @param searchTerm - Term searched by user
 * @param start - Index of where to start returning data
 * @param end - Index of where to end returning data
 * @returns - Array of Terms, it's size depends on passed indexes ( end - start )
 */
export const termParser = (data, searchTerm, start?, end?) => {
    let terms : Terms;
    if ( Array.isArray(data) ){
        terms  = data?.map( term => {
            return getTerm(term)
        })
    } else {
        terms = [getTerm(data)]
    }

    // We are receiving an unknown amout of terms from server, we need to control
    // how much to send back based on request made (start,end)
    const results = formatTerms(terms,searchTerm, start, end);
    const filters = getFilters(results);
    return {
        filters : filters,
        results : results
    }
};

export const elasticSearchParser = (data) => {
    // TODO add the score to the results
    let terms : Terms;
    if ( Array.isArray(data) ){
        terms  = data?.map( term => {
            let newTerm : Term = {} as Term
            newTerm = term._source
            newTerm['score'] = term._score
            return newTerm
        })

        // We are receiving an unknown amout of terms from server, we need to control
        // how much to send back based on request made (start,end)
        const results = terms;
        const filters = getFilters(results);
        return {
            filters : filters,
            results : results
        }
    } else {
        return { filters : {} ,results : []}
    }
};

export default termParser;
