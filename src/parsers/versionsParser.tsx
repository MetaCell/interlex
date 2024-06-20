import { Version, Versions } from "./../model/frontend/versions";
import { versionKeys, versionPrefixes } from "../configuration/model";

/**
 * Takes in raw version data object from server and formats it into Version object 
 * that the client can use. 
 * 
 * @param data - Raw version data object received from server
 * @returns - Version
 */
const getVersion = (data) => {
    let version : Version = {} as Version
    // Extract triplets if predicate is in model 
    data?.["@graph"]?.forEach( object => {
        const keys = Object.keys(object);
        keys.forEach( key => {
            const predicate = key;
            if ( versionPrefixes[predicate] ) {
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
                if ( version[versionPrefixes[predicate]?.key] === undefined ) {
                    version[versionPrefixes[predicate]?.key] = dataToStore
                }
            }
        }) 
    })

    return version;
}

/** Return results between two indeces */
const indexRange = (arr, start, end) => {
    return arr.slice(start, end)
}

/** Format versions and return array between two indeces */
const formatVersions = (versions, searchVersion, start, end) => {
    return indexRange(versions?.filter( t => {
        const label = t.label?.toLowerCase();
        const search = searchVersion?.toLowerCase()
        if ( t !== undefined && ( label?.includes(search) || search == undefined) ) { 
            return true;
        }

        return false;
    }), start, end);
}

/**
 * 
 * @param data - Data returned from server
 * @param searchVersion - Version searched by user
 * @param start - Index of where to start returning data
 * @param end - Index of where to end returning data
 * @returns - Array of Versions, it's size depends on passed indexes ( end - start )
 */
export const versionsParser = (data, searchVersion, start, end) => {
    const versions : Versions = data?.map( version => {
        return getVersion(version)
    })

    // We are receiving an unknown amout of versions from server, we need to control
    // how much to send back based on request made (start,end)
    return formatVersions(versions,searchVersion, start, end);
};

export default versionsParser;