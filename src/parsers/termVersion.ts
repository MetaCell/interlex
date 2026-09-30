// The backend keeps no version counter. A term's persisted versions are content hashes (identity
// graphs) listed by /{group}/{term}/versions, while the owl:versionIRI on its .jsonld is stamped
// with the response time and so changes on every load. A version's number is therefore its
// position in its fork's history, oldest first.

interface Appearance {
  uri?: string;
  first_seen?: string;
}

interface VersionRecord {
  'identity-graph'?: string;
  appears_in?: Appearance[];
}

interface VersionsData {
  versions?: VersionRecord[];
}

export interface TermVersion {
  number: number;
  identityGraph: string;
}

interface HistoryEntry {
  identityGraph: string;
  firstSeen: number;
  lastSeen: number;
}

// "2025-07-14T07:51:30,032321Z" -> ms (the backend uses a comma as decimal separator)
const parseBackendDate = (value?: string): number => new Date(String(value).replace(',', '.')).getTime();

// "http://uri.interlex.org/base/ontologies/sync" -> "base"
const forkOf = (uri?: string): string | undefined =>
  String(uri ?? '').split('http://uri.interlex.org/')[1]?.split('/')[0];

const historyOf = (versions: VersionRecord[], fork: string): HistoryEntry[] =>
  versions
    .flatMap((version) => {
      const seen = (version.appears_in ?? [])
        .filter((appearance) => forkOf(appearance.uri) === fork)
        .map((appearance) => parseBackendDate(appearance.first_seen));
      const identityGraph = version['identity-graph'];
      if (!identityGraph || !seen.length) return [];
      return [{ identityGraph, firstSeen: Math.min(...seen), lastSeen: Math.max(...seen) }];
    })
    .sort((a, b) => a.firstSeen - b.firstSeen);

const oldestForkOf = (version: VersionRecord): string | undefined => {
  const oldest = [...(version.appears_in ?? [])].sort(
    (a, b) => parseBackendDate(a.first_seen) - parseBackendDate(b.first_seen)
  )[0];
  return forkOf(oldest?.uri);
};

/**
 * With `identityGraph`, numbers that version within the fork it was first published in (History
 * links to versions of every fork). Without it, returns the group's current version: the one it
 * published most recently, which may be an older number when a change was reverted.
 */
export const resolveTermVersion = (
  versionsData: VersionsData | null | undefined,
  group: string,
  identityGraph?: string
): TermVersion | undefined => {
  const versions = Array.isArray(versionsData?.versions) ? versionsData!.versions! : [];

  let history: HistoryEntry[];
  let target: HistoryEntry | undefined;
  if (identityGraph) {
    const record = versions.find((version) => version['identity-graph'] === identityGraph);
    const fork = record && oldestForkOf(record);
    history = fork ? historyOf(versions, fork) : [];
    target = history.find((entry) => entry.identityGraph === identityGraph);
  } else {
    history = historyOf(versions, group);
    target = history.reduce<HistoryEntry | undefined>(
      (latest, entry) => (!latest || entry.lastSeen > latest.lastSeen ? entry : latest),
      undefined
    );
  }

  if (!target) return undefined;
  return { number: history.indexOf(target) + 1, identityGraph: target.identityGraph };
};

/** Has `group` published any version of the term, i.e. does it already hold a fork of it? */
export const hasForkIn = (versionsData: VersionsData | null | undefined, group?: string): boolean =>
  Boolean(group) &&
  (versionsData?.versions ?? []).some((version) =>
    (version.appears_in ?? []).some((appearance) => forkOf(appearance.uri) === group)
  );
