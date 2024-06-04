import { Term } from "./../model/frontend/term";
import { Terms } from "./../model/frontend/terms";
import { termKeys, termPredicates } from "../configuration/model";

/**
 * Takes in raw term data object from server and formats it into Term object 
 * that the client can use. 
 * 
 * @param data - Raw term data object received from server
 * @returns - Term
 */
const getTerm = (data) => {
    let term : Term = {} as Term
    let idMatch = data.triples?.[0]?.[0]?.match(/\<(.*)\>/)?.pop()?.split("/");
    let id = idMatch[idMatch.length - 1];
    // Extract triplets if predicate is in model 
    data.triples?.forEach( triple => {
        const predicate = termPredicates[triple[1]]?.key;
        // parse synonym, existing ID or hierarchy
        if ( predicate === termKeys.synonym || predicate === termKeys.existingID || predicate === termKeys.hierarchy) {
            let match = triple[2].match(/\<(.*)\>/)?.pop();
            if ( match == undefined ) {
                match = triple[2]
            }
            term[termPredicates[triple[1]].key] = term[termPredicates[triple[1]].key] ? [...term[termPredicates[triple[1]].key], match] : [match]
        } else if ( termPredicates[triple[1]] ) {
            term[termPredicates[triple[1]].key] = triple[2]
        } 
    })

    term[termKeys.id] = id;

    return term;
}

/** Return results between two indeces */
const indexRange = (arr, start, end) => {
    return arr.slice(start, end)
}

/** Format terms and return array between two indeces */
const formatTerms = (terms, searchTerm, start, end) => {
    return indexRange(terms?.filter( t => t !== undefined && t.label?.toLowerCase().includes(searchTerm.toLowerCase())), start, end)
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
    const terms : Terms = data?.map( term => {
        return getTerm(term)
    })

    // We are receiving an unknown amout of terms from server, we need to control
    // how much to send back based on request made (start,end)
    return formatTerms(terms,searchTerm, start, end);
};

export default termParser;