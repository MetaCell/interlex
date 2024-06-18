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
    // Extract triplets if predicate is in model 
    data?.["@graph"]?.forEach( object => {
        const keys = Object.keys(object);
        keys.forEach( key => {
            const predicate = key;
            if ( termPredicates[predicate] ) {
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
                        }
                    })
                }
                if ( term[termPredicates[predicate]?.key] === undefined ) {
                    term[termPredicates[predicate]?.key] = dataToStore
                }
            }
        }) 
    })

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
        if ( t !== undefined && ( label.includes(search) || search == undefined) ) { 
            return true;
        }

        return false;
    }), start, end);
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