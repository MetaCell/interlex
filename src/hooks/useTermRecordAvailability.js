import { useState, useEffect } from 'react';
import { isIlxTermSlug } from '../components/CellCards/config/gridConfig';
import { hasInterLexRecord } from '../api/endpoints/apiService';

/**
 * Can the InterLex term API serve this term — i.e. are the tabs backed by it (Overview, Variants,
 * Version history, Discussions) worth offering?
 *
 * An `ilx_*` / `tmp_*` slug addresses a record by construction and answers synchronously. A
 * Precision cell arrives as an external id (`npokb_991`) instead, and is only addressable once
 * curation maps it — a question only the backend can answer, at /{group}/uris/{prefix}/{id}.
 *
 * Returns `true`, `false`, or **`undefined` while the probe is in flight**. Callers must not read
 * pending as "no": the term page redirects away from a disabled tab with `replace: true`, so
 * acting on `undefined` would discard a deep link to /overview before the answer lands.
 *
 * @param {string} term   term slug from the URL
 * @param {string} group  group the page is viewed under; falls back to `base`, as term data does
 * @param {boolean} enabled  pass false to skip the probe entirely (returns `undefined`) — for
 *   terms whose tabs are not gated on this, so an unrelated term never pays a request.
 */
export const useTermRecordAvailability = (term, group, enabled = true) => {
  const addressesRecord = isIlxTermSlug(term);
  const [probed, setProbed] = useState(undefined);

  useEffect(() => {
    if (!enabled || addressesRecord) return undefined;
    let active = true;
    // Drop the previous term's answer: leaving it up would gate the new term on the old one.
    setProbed(undefined);
    hasInterLexRecord(term, group).then((found) => {
      if (active) setProbed(found);
    });
    return () => { active = false; };
  }, [term, group, enabled, addressesRecord]);

  if (!enabled) return undefined;
  return addressesRecord ? true : probed;
};

export default useTermRecordAvailability;
