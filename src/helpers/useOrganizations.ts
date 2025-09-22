import { useState, useEffect } from 'react';
import { getOrganizations, createNewOrganization } from '../api/endpoints/apiService';

interface OrganizationData {
  role: string | null;
  name: string;
}

export const useOrganizations = (groupname: string) => {
  const [listView, setListView] = useState('list');
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>();

  const fetchOrganizations = async () => {
    setLoading(true);
    
    try {
      const response = await getOrganizations(groupname);
      
      if (response && response.length > 0) {
        // The response is an array of [role, organizationName] pairs
        const processedOrganizations = response.map((orgData: any) => {
          // Each orgData should be a [role, name] array
          if (Array.isArray(orgData) && orgData.length >= 2) {
            return {
              role: orgData[0],  // First element is the role
              name: orgData[1]   // Second element is the organization name
            };
          } else {
            console.warn('Unexpected organization data format:', orgData);
            // Fallback for unexpected format
            return {
              role: null,
              name: String(orgData)
            };
          }
        });
        
        setOrganizations(processedOrganizations);
      } else {
        setOrganizations([]);
      }
    } catch (err) {
      console.error('An unknown error occurred: ', err);
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    setLoading(true);
  
    try {
      await createNewOrganization({ group: groupname, data: "a test" });
    } catch (err: any) {
      console.error('An unknown error occurred: ', err);
      if (err.response?.status === 501) {
        setMessage(err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchOrganizations();
  }, []);

  return {
    listView,
    setListView,
    organizations,
    loading,
    message,
    createOrganization,
    fetchOrganizations
  };
};
