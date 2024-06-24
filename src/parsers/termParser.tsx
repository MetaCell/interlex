import { Term, Terms } from "./../model/frontend/terms";
import { termKeys, termPrefixes } from "../configuration/model";
import { defaultTermFiltersSections } from "../configuration/filters";

/**
 * Takes in raw term data object from server and formats it into Term object 
 * that the client can use. 
 * 
 * @param data - Raw term data object received from server
 * @returns - Term
 */
const getTerm = (data) => {
    let term : Term = {} as Term
    let predicates = {};
    // Extract triplets if predicate is in model 
    data?.["@graph"]?.forEach( object => {
        const keys = Object.keys(object);
        keys.forEach( key => {
            const predicate = key;
            if ( termPrefixes[predicate] ) {
                let value = object[key];
                let dataToStore = value;
                if ( value?.["@id"] ) {
                    dataToStore = value?.["@id"] 
                } 

                if ( Array.isArray(value) ) {
                    dataToStore = [];
                    value?.forEach( v => {
                        if ( v?.["@id"] ) {
                            dataToStore = [...dataToStore, v?.["@id"]]
                        } else {
                            dataToStore = [...dataToStore, v]
                        }
                    })
                }
                if ( term[termPrefixes[predicate]?.key] === undefined ) {
                    term[termPrefixes[predicate]?.key] = dataToStore
                }

                if ( termPrefixes[predicate]?.isPredicate ) {
                    if ( Array.isArray(dataToStore) ){
                        dataToStore?.forEach( pred => {
                            let newPredicate = {
                                subject : { id : term.id },
                                predicate: predicate,
                                object : { value : pred }
                            }
                            predicates[predicate] ? predicates[predicate].push(newPredicate) : predicates[predicate] = [newPredicate]
                        })
                    } else {
                        let newPredicate = {
                            subject : { id : term.id },
                            predicate: predicate,
                            object : { id : dataToStore }
                        }
                        predicates[predicate] ? predicates[predicate].push(newPredicate) : predicates[predicate] = [newPredicate]
                    }
                }
            }
        }) 
    })

    // Add Subject ID and Label from Term to each predicate.
    Object.keys(predicates)?.forEach( key => {
        predicates[key]?.forEach( pred => {
            pred.subject.id = term.id;
            pred.subject.label = term.label;
        })
    })

    term.predicates = predicates;

    return term;
}

/** Return results between two indeces */
const indexRange = (arr, start, end) => {
    return arr.slice(start, end)
}

/** Format terms and return array between two indeces */
const formatTerms = (terms, searchTerm, start, end) => {
    return indexRange(terms?.filter( t => {
        const label = t.label?.toLowerCase();
        const search = searchTerm?.toLowerCase()
        if ( t !== undefined && ( label?.includes(search) || search == undefined) ) { 
            return true;
        }

        return false;
    }), start, end);
}

const getFilters = ( terms ) => {
    let filters = {};
    const filtersKeys = Object.keys(defaultTermFiltersSections);
    filtersKeys?.forEach( key => {
        filters[key] = {};
    })

    terms.forEach( term => {
        filtersKeys?.forEach( key => {
            if ( term[termPrefixes[defaultTermFiltersSections[key]]?.key] != undefined ) {
                const label = term[termPrefixes[defaultTermFiltersSections[key]]?.key];
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
export const termParser = (data, searchTerm, start, end) => {
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

export default termParser;