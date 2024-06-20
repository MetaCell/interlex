import { Variant, Variants } from "./../model/frontend/variants";
import { variantKeys, variantPrefixes } from "../configuration/model";

/**
 * Takes in raw variant data object from server and formats it into Variant object 
 * that the client can use. 
 * 
 * @param data - Raw variant data object received from server
 * @returns - Variant
 */
const getVariant = (data) => {
    let variant : Variant = {} as Variant
    // Extract triplets if predicate is in model 
    data?.["@graph"]?.forEach( object => {
        const keys = Object.keys(object);
        keys.forEach( key => {
            const predicate = key;
            if ( variantPrefixes[predicate] ) {
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
                if ( variant[variantPrefixes[predicate]?.key] === undefined ) {
                    variant[variantPrefixes[predicate]?.key] = dataToStore
                }
            }
        }) 
    })

    return variant;
}

/** Return results between two indeces */
const indexRange = (arr, start, end) => {
    return arr.slice(start, end)
}

/** Format variants and return array between two indeces */
const formatVariants = (variants, searchVariant, start, end) => {
    return indexRange(variants?.filter( t => {
        const label = t.label?.toLowerCase();
        const search = searchVariant?.toLowerCase()
        if ( t !== undefined && ( label.includes(search) || search == undefined) ) { 
            return true;
        }

        return false;
    }), start, end);
}

/**
 * 
 * @param data - Data returned from server
 * @param searchVariant - Variant searched by user
 * @param start - Index of where to start returning data
 * @param end - Index of where to end returning data
 * @returns - Array of Variants, it's size depends on passed indexes ( end - start )
 */
export const variantsParser = (data, searchVariant, start, end) => {
    const variants : Variants = data?.map( variant => {
        return getVariant(variant)
    })

    // We are receiving an unknown amout of variants from server, we need to control
    // how much to send back based on request made (start,end)
    return formatVariants(variants,searchVariant, start, end);
};

export default variantsParser;