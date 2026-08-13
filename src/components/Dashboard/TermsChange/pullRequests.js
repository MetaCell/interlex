/**
 * Mapping between the backend's pull-request records (GET /<group>/pulls) and the rows the
 * dashboard lists.
 *
 * The backend documents "pending" and leaves room for other states, so statuses are bucketed
 * rather than matched one-to-one; anything unrecognised stays in the open bucket (where it is
 * still actionable) and keeps its raw status on the row so nothing is silently reclassified.
 */

export const PR_STATUS = {
  REQUESTED: 'requested',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const APPROVED_STATUSES = new Set(['merged', 'approved', 'accepted', 'complete', 'completed', 'done']);
const REJECTED_STATUSES = new Set(['rejected', 'declined', 'denied', 'closed', 'cancelled', 'canceled']);

export const bucketForStatus = (status) => {
  const value = String(status || '').trim().toLowerCase();
  if (APPROVED_STATUSES.has(value)) return PR_STATUS.APPROVED;
  if (REJECTED_STATUSES.has(value)) return PR_STATUS.REJECTED;
  return PR_STATUS.REQUESTED;
};

/** "http://uri.interlex.org/base/ilx_0101431" -> "ilx_0101431" */
export const termIdFromSubject = (subject) =>
  String(subject || '').match(/(?:ilx|tmp)_\d+/i)?.[0] || '';

/**
 * "http://host/base/pulls/1" -> "/base/pull-requests/1".
 *
 * The record's own path is a backend API address (and is proxied as one), so the app cannot
 * route on it — a navigation there would be answered with the JSON record. The in-app view
 * lives at the parallel /pull-requests/ path instead.
 */
export const appPathFromPullUrl = (url) => {
  const path = (() => {
    if (!url) return null;
    try {
      return new URL(url).pathname;
    } catch {
      return url.startsWith('/') ? url : null;
    }
  })();

  const match = path?.match(/^\/([^/]+)\/pulls\/([^/]+)/);
  return match ? `/${match[1]}/pull-requests/${match[2]}` : null;
};

export const mapPullRecord = (record, index = 0) => {
  const termId = termIdFromSubject(record?.subject);
  return {
    id: record?.url || `${record?.subject}-${index}`,
    path: appPathFromPullUrl(record?.url),
    status: bucketForStatus(record?.status),
    rawStatus: record?.status,
    termId,
    subject: record?.subject,
    date: record?.['created-datetime'],
    fromGroup: record?.['from-groupname'],
    fromPerspective: record?.['from-pers-name'],
    toGroup: record?.['to-groupname'],
    toPerspective: record?.['to-pers-name'],
    fromIdentity: record?.['from-identity'],
    toIdentity: record?.['to-identity'],
    url: record?.url,
  };
};

export const mapPullRecords = (data) => {
  const records = Array.isArray(data?.records) ? data.records : [];
  return records.map(mapPullRecord);
};
