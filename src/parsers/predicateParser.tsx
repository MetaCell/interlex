export type PredicateTriple = {
    subject: string;
    predicate: string;
    object: string;
  };
  
  export type PredicateGroup = {
    title: string;
    count: number;
    tableData: PredicateTriple[];
  };
  
  /**
   * Build predicate groups for the focus owl:Class in a JSON-LD document.
   * Collects:
   *  - All outgoing predicates on the focus node (including @id/@type).
   *  - All inbound predicates from any other node where the object equals the focus @id.
   */
  export function buildPredicateGroupsForFocus(jsonld: any, termId?: string): PredicateGroup[] {
    const graph: any[] = Array.isArray(jsonld?.['@graph']) ? jsonld['@graph'] : [];
  
    // Resolve focus node
    const ilxSuffix = (termId || '').replace(/^ILX:/i, 'ilx_');
    const endsWithIlx = (id: string) =>
      typeof id === 'string' &&
      ilxSuffix &&
      id.toLowerCase().endsWith(`/${ilxSuffix.toLowerCase()}`);
  
    let focus: any =
      graph.find((o) => o?.['@type'] === 'owl:Class' && endsWithIlx(o?.['@id'])) ||
      graph.find((o) => o?.['@type'] === 'owl:Class') ||
      null;
  
    const flatten = (v: any): string => {
      if (v == null) return '';
      if (typeof v === 'string') return v;
      if (Array.isArray(v)) return v.map(flatten).join(', ');
      if (typeof v === 'object') return v['@id'] ?? v['@value'] ?? v.value ?? JSON.stringify(v);
      return String(v);
    };
  
    const predicatesMap: Record<string, PredicateTriple[]> = {};
    const pushTriple = (subjectId: string, predicateKey: string, value: any) => {
      const triple = { subject: subjectId, predicate: predicateKey, object: flatten(value) };
      (predicatesMap[predicateKey] ||= []).push(triple);
    };
  
    if (!focus || !focus['@id']) return [];
  
    const focusId = String(focus['@id']);
  
    // 1) Outgoing: everything on the focus node
    pushTriple(focusId, '@id', focusId);
    const typeVal = focus['@type'];
    if (typeVal !== undefined) {
      if (Array.isArray(typeVal)) typeVal.forEach((v) => pushTriple(focusId, '@type', v));
      else pushTriple(focusId, '@type', typeVal);
    }
    for (const key of Object.keys(focus)) {
      if (key === '@id' || key === '@type' || key === 'isAbout' || key === 'ilx.isAbout') continue;
      const val = (focus as any)[key];
      if (Array.isArray(val)) val.forEach((v) => pushTriple(focusId, key, v));
      else pushTriple(focusId, key, val);
    }
  
    // 2) Inbound: for every other node, if any property value equals the focus @id, include that triple
    for (const node of graph) {
      const subjId = node?.['@id'];
      if (!subjId) continue;
  
      for (const key of Object.keys(node)) {
        if (key === '@id' || key === '@type') continue;
        const val = (node as any)[key];
  
        // helper to check a value (object|string|array) for references to focusId
        const addIfMatches = (v: any) => {
          if (v && typeof v === 'object' && v['@id'] === focusId) {
            pushTriple(String(subjId), key, v);
          } else if (typeof v === 'string' && v === focusId) {
            pushTriple(String(subjId), key, v);
          }
        };
  
        if (Array.isArray(val)) val.forEach(addIfMatches);
        else addIfMatches(val);
      }
    }
  
    // Group into the gold-standard shape
    return Object.keys(predicatesMap).map((title) => ({
      title,
      count: predicatesMap[title].length,
      tableData: predicatesMap[title],
    }));
  }
  
  