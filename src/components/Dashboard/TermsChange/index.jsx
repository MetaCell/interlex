import List from "./List";
import { Box, CircularProgress, Typography } from "@mui/material";
import BasicTabs from "../../common/CustomTabs";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import CustomPagination from "../../common/CustomPagination";
import { getPullRequests, listAllPullRequests, getOrganizations } from "../../../api/endpoints/apiService";
import { GlobalDataContext } from "../../../contexts/DataContext";
import { mapPullRecord, mapPullRecords, PR_STATUS } from "./pullRequests";
import { isAdminFromRoles } from "../../PullRequest/permissions";

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [truncated, setTruncated] = useState(false);

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

    const load = async () => {
      const admin = await getOrganizations(groupname)
        .then(isAdminFromRoles)
        .catch(() => false);
      if (!active) return;
      setIsAdmin(admin);

      // `/<group>/pulls` only lists requests *into* that group, so these two answer "sent to
      // me" and "sent to curated" — never the ones this user opened against someone else.
      const groups = Array.from(new Set([groupname, CURATED_GROUP]));
      const listed = await Promise.allSettled(groups.map(group => getPullRequests(group)));
      listed.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Error fetching pull requests for "${groups[index]}":`, result.reason);
        }
      });

      // Walking the id sequence is what finds the rest: this user's outgoing requests, and —
      // for an admin, who curates every group — everybody else's.
      const walked = await listAllPullRequests().catch(error => {
        console.error('Error walking the pull request sequence:', error);
        return { records: [], truncated: false };
      });
      if (!active) return;

      const answered = listed.filter(result => result.status === 'fulfilled');
      if (!answered.length && !walked.records.length) {
        setError(listed[0]?.reason?.message || 'Request failed');
        setPullRequests([]);
        setLoading(false);
        return;
      }

      // A request shows up in several of these, keyed by *pull id* rather than url: the same
      // record read through two group paths reports two different urls for the one request.
      // An admin reviews every group; everyone else sees only requests they are a party to.
      const byId = new Map();
      [
        ...answered.flatMap(result => mapPullRecords(result.value)),
        ...walked.records.map(mapPullRecord),
      ]
        .filter(entry => admin || entry.fromGroup === groupname || entry.toGroup === groupname)
        .forEach(entry => byId.set(entry.pullId || entry.id, entry));

      setPullRequests([...byId.values()]);
      setTruncated(walked.truncated);
      setLoading(false);
    };

    load();
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
    return (
      <>
        <List entries={visibleEntries} viewerGroup={groupname} />
        {/* Say so rather than let a capped walk read as "this is all of them". */}
        {truncated && (
          <Typography color={gray600} fontSize=".875rem" mt="0.75rem">
            Showing the first requests only — there are more than this view walks.
          </Typography>
        )}
      </>
    );
  }, [loading, error, visibleEntries, tabValue, truncated, groupname]);

  return (
    <Box p='2.5rem 5rem' sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.75rem',
      backgroundColor: gray25
    }}>
      <Typography fontSize='1.5rem' color={gray600} fontWeight={600}>
        {/* An admin curates every group, so this section is everybody's requests, not theirs. */}
        {isAdmin ? 'All Pull Requests' : 'My Pull Requests'}
      </Typography>
      <BasicTabs tabValue={tabValue} handleChange={handleChangeTabs} tabs={TABS.map(tab => tab.label)} />
      {renderBody()}
      <CustomPagination rowCount={filteredEntries?.length} rowsPerPage={numberOfVisiblePages} page={page} onPageChange={handlePageChange} />
    </Box>
  );
};

export default TermsChange;
