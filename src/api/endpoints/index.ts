import { Organizations } from '../../model/backend';
import * as mockApi from './../../api/endpoints/swaggerMockMissingEndpoints';
import { validateOrganizations } from './../openapi-response-validator';

const useMockApi = () => mockApi;

export const getOrganizations = () => {
    /** Call endpoint for retrieving organizations, this is a mock endpoint
    created by us */
    const {  getOrganizations } = useMockApi();

    /** Call Endpoint */
    const organizations = getOrganizations().then((data) => {
        // Validate organizations data received
        const result = validateOrganizations(data)
        // Returns { valid : boolean, error : ""}
        if ( result.valid ) {
            return data as Organizations;
        } else {
            return result.error;
        }
      })
      .catch((error) => {
        return error;
      });
}