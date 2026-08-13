import List from "./List";
import { Box, CircularProgress, Typography } from "@mui/material";
import BasicTabs from "../../common/CustomTabs";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import CustomPagination from "../../common/CustomPagination";
import { getPullRequests } from "../../../api/endpoints/apiService";
import { GlobalDataContext } from "../../../contexts/DataContext";
import { mapPullRecords, PR_STATUS } from "./pullRequests";

import { vars } from "../../../theme/variables";
const { gray25, gray600 } = vars;

// A request is recorded against both sides, and the backend lists it under the *to* group
// (curated) as well as the fork it came from — so ask both and keep whatever answers.
const CURATED_GROUP = 'base';

// Tab order matches the buckets the backend statuses are folded into.
const TABS = [
  { label: "Requests", status: PR_STATUS.REQUESTED, empty: "No open merge requests." },
  { label: "Approved", status: PR_STATUS.APPROVED, empty: "No approved merge requests yet." },
  { label: "Rejected", status: PR_STATUS.REJECTED, empty: "No rejected merge requests." },
];

const TermsChange = () => {
  const { user } = useContext(GlobalDataContext);
  const { group } = useParams();
  // The dashboard is the user's own; fall back to the group in the URL when the session has
  // not resolved yet, so a hard reload still lists something.
  const groupname = user?.groupname || group;

  const [numberOfVisiblePages] = useState(8);
  const [page, setPage] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const [pullRequests, setPullRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleChangeTabs = (event, newValue) => {
    setTabValue(newValue);
    setPage(1);
  };

  useEffect(() => {
    if (!groupname) return;
    let active = true;
    setLoading(true);
    setError(null);

    const groups = Array.from(new Set([groupname, CURATED_GROUP]));
    Promise.allSettled(groups.map(group => getPullRequests(group)))
      .then(results => {
        if (!active) return;
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Error fetching pull requests for "${groups[index]}":`, result.reason);
          }
        });

        const answered = results.filter(result => result.status === 'fulfilled');
        // Only a total failure is an error: one group listing fine is enough to show something.
        if (!answered.length) {
          setError(results[0]?.reason?.message || 'Request failed');
          setPullRequests([]);
          setLoading(false);
          return;
        }

        // The same request comes back from both listings, so dedupe on its url, and keep only
        // the ones this user is a party to — a curated listing carries everybody's.
        const byId = new Map();
        answered
          .flatMap(result => mapPullRecords(result.value))
          .filter(entry => entry.fromGroup === groupname || entry.toGroup === groupname)
          .forEach(entry => byId.set(entry.id, entry));

        setPullRequests([...byId.values()]);
        setLoading(false);
      });
    return () => { active = false; };
  }, [groupname]);

  const filteredEntries = useMemo(
    () => pullRequests.filter(entry => entry.status === TABS[tabValue].status),
    [pullRequests, tabValue]
  );

  const visibleEntries = useMemo(() => {
    const start = (page - 1) * numberOfVisiblePages;
    return filteredEntries.slice(start, start + numberOfVisiblePages);
  }, [filteredEntries, page, numberOfVisiblePages]);

  const renderBody = useCallback(() => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      );
    }
    if (error) {
      return <Typography color={gray600}>Could not load your merge requests: {error}</Typography>;
    }
    if (!visibleEntries.length) {
      return <Typography color={gray600}>{TABS[tabValue].empty}</Typography>;
    }
    return <List entries={visibleEntries} />;
  }, [loading, error, visibleEntries, tabValue]);

  return (
    <Box p='2.5rem 5rem' sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.75rem',
      backgroundColor: gray25
    }}>
      <Typography fontSize='1.5rem' color={gray600} fontWeight={600}>
        My Pull Requests
      </Typography>
      <BasicTabs tabValue={tabValue} handleChange={handleChangeTabs} tabs={TABS.map(tab => tab.label)} />
      {renderBody()}
      <CustomPagination rowCount={filteredEntries?.length} rowsPerPage={numberOfVisiblePages} page={page} onPageChange={handlePageChange} />
    </Box>
  );
};

export default TermsChange;
