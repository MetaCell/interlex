import { useContext, useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import SingleOrganization from "./SingleOrganization";
import { getOrganizations, getUserSettings } from "../api/endpoints/apiService";
import { GlobalDataContext } from "../contexts/DataContext";

const USER = "user";
const ORGANIZATION = "organization";

// Users and organizations share the /{name} namespace, and only the group's settings tell them
// apart: a user's carry an email and an ORCID, an organization's carry neither or cannot be read
// at all (404).
const isUserSettings = (settings) =>
  Boolean(settings?.orcid && settings?.emails?.some((entry) => entry?.email));

const sameName = (a, b) => a?.toLowerCase() === b?.toLowerCase();

// Group names are case-sensitive on the backend (`MetaCell` exists, `metacell` answers 404 on every
// endpoint), but a typed address rarely matches the casing. The signed-in user's organizations are
// the only listing the backend offers to recover it from.
const canonicalOrganizationName = async (name, username) => {
  if (!username) return name;
  try {
    const organizations = await getOrganizations(username);
    const match = (Array.isArray(organizations) ? organizations : []).find(([, orgName]) => sameName(orgName, name));
    return match ? match[1] : name;
  } catch {
    return name;
  }
};

const resolveGroup = async (name, username) => {
  if (sameName(name, username)) return { kind: USER, name: username };
  const isUser = await getUserSettings(name)
    .then((response) => isUserSettings(response?.settings))
    .catch(() => false);
  if (isUser) return { kind: USER, name };
  return { kind: ORGANIZATION, name: await canonicalOrganizationName(name, username) };
};

const useResolvedGroup = (name, username) => {
  const [resolved, setResolved] = useState({ requested: null, group: null });

  useEffect(() => {
    let active = true;
    resolveGroup(name, username).then((group) => {
      if (active) setResolved({ requested: name, group });
    });
    return () => {
      active = false;
    };
  }, [name, username]);

  return resolved.requested === name ? resolved.group : null;
};

const GroupPage = () => {
  const { title } = useParams();
  const { user } = useContext(GlobalDataContext);
  const group = useResolvedGroup(title, user?.groupname);

  if (!group) {
    return (
      <Box flex={1} display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (group.kind === USER) return <Navigate to={`/${group.name}/dashboard`} replace />;
  if (group.name !== title) return <Navigate to={`/${group.name}`} replace />;
  return <SingleOrganization />;
};

export default GroupPage;
