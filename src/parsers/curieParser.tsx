import { Curie } from "./../model/frontend/curie";
import { Curies } from "./../model/frontend/curies";

/**
 * Takes in raw term data object from server and formats it into Term object 
 * that the client can use. 
 * 
 * @param data - Raw term data object received from server
 * @returns - Term
 */
const getCurie = (data, key) => {
    let curie : Curie = {} as Curie

    const prefix = key;
    const nameSpace = data[key];

    curie.namespace = nameSpace;
    curie.prefix = prefix;

    return curie;
}

/** Return results between two indeces */
const indexRange = (arr, start, end) => {
    return arr?.slice(start, end)
}

/** Format terms and return array between two indeces */
const formatCuries = (curies, start, end) => {
    return indexRange(curies, start, end);
}

/**
 * 
 * @param data - Data returned from server
 * @param start - Index of where to start returning data
 * @param end - Index of where to end returning data
 * @returns - Array of Terms, it's size depends on passed indexes ( end - start )
 */
export const curieParser = (data, start, end) => {
    const keys = Object.keys(data[0]);

    const curies : Curies = keys?.map( curie => {
        return getCurie(data[0],curie)
    })

    // We are receiving an unknown amout of terms from server, we need to control
    // how much to send back based on request made (start,end)
    return formatCuries(curies, start, end);
};

export default curieParser;