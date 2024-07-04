import { assert } from 'console';
import { OrganizationsIcon } from '../../Icons';
import { Organizations, Organization } from '../../model/backend';
import * as mockApi from './../../api/endpoints/swaggerMockMissingEndpoints';

const useMockApi = () => mockApi;

export const getOrganizations = () => {
    /** Call endpoint for retrieving organizations, this is a mock endpoint
    created by us */
    const {  getOrganizations } = useMockApi();

    /** Call Endpoint */
    const organizations = getOrganizations().then((data) => {
        const organizations = data as Organizations;
        return organizations;
      })
      .catch((error) => {
        return error;
      });
}