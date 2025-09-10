import { useState, useEffect } from 'react';
import { getOrganizations, createNewOrganization } from '../api/endpoints/apiService';

export const useOrganizations = (groupname: string) => {
  const [listView, setListView] = useState('list');
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState();

  const fetchOrganizations = async () => {
    setLoading(true);
    
    try {
      const response = await getOrganizations(groupname);
      if (response.length > 0) {
        // Replace "owner" with the actual username/groupname
        const processedOrganizations = response[0].map((org: string) => 
          org === "owner" ? groupname : org
        );
        setOrganizations(processedOrganizations);
      }
    } catch (err) {
      console.error('An unknown error occurred: ', err);
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async (event) => {
    if (event) event.preventDefault();
    setLoading(true);
  
    try {
      await createNewOrganization({ group: groupname, data: "a test" });
    } catch (err) {
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
    open,
    createOrganization,
    fetchOrganizations
  };
};
