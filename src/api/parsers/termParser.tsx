import { Term } from "./../model/frontend/term";
import { Terms } from "./../model/frontend/terms";
import { keys, predicates } from "../../configuration/model";

const getTerm = (data) => {
    let termObject : Term = {} as Term
    data.triples?.forEach( triple => {
        const predicate = predicates[triple[1]]?.key;
        if ( predicate === keys.synonym || predicate === keys.existingID || predicate === keys.hierarchy) {
            let match = triple[2].match(/\<(.*)\>/)?.pop();
            if ( match == undefined ) {
                match = triple[2]
            }
            termObject[predicates[triple[1]].key] = termObject[predicates[triple[1]].key] ? [...termObject[predicates[triple[1]].key], match] : [match]
        } else if ( predicates[triple[1]] ) {
            termObject[predicates[triple[1]].key] = triple[2]
        } 
    })

    termObject[keys.id] = data.id;

    return termObject;
}

export const termParser = (data, searchTerm) => {
    const terms : Terms = data?.map( term => {
        //TODO : remove 'if statement' check once mock server is replace will real feed
        if ( term?.id?.includes(searchTerm) ) {
            return getTerm(term)
        }
    })

    return terms?.filter( t => t !== undefined )
};

export default termParser;