import Ajv from "ajv"
import { load } from "js-yaml"
import Axios from "axios"; // Import Axios or use Fetch.


let ajv;

/** Load yaml file with mock endpoints, 
these mock endpoints are the missing ones from the given openApi contract
*/
Axios('./../../interlex.yaml').then(res => {
    const openapiDescription = load(res.data)
    try {
        ajv = new Ajv({ strict: false })
        ajv.addSchema(openapiDescription, "interlex.yaml")
    }
    catch (error) {
        console.error("Error during schema validation ", error.message)
    }
});

/**
 * This method takes in the HTTP Response from the server while retrieving 
 * organizations. Currently the OpenApi contract from the client doesn't have
 * and endpoint for retrieving organizations, so it has been mocked on interlex.yaml.
 * It validates the response against the Data Model on the schema, if it fails
 * ajv.validate() returns false.
 * 
 * @param {*} organizations : HTTP Response, the array response from retrieving
 * organizations from the server.
 * @returns : Object with a flag for validation result, and error in case validation fails.
 */
export const validateOrganizations = (organizations) => {
    let validate = ajv.validate({ "$ref": "interlex.yaml#/components/schemas/Organizations" }, organizations)

    const result = {
        valid: validate,
        error: ajv.errorsText(validate.errors)
    };

    return result;
}
