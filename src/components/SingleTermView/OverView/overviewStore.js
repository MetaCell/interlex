import { BehaviorSubject } from "rxjs";
import { useEffect, useState } from "react";

// Per-section state streams for the term Overview. OverView writes to these as
// each independent fetch resolves; each section component subscribes only to
// its own stream, so a slow section finishing never re-renders its siblings
// (and never resets the scroll position of a section you are already reading).
export const createOverviewStore = () => ({
  details$: new BehaviorSubject({ loading: true, data: null, jsonData: null }),
  hierarchy$: new BehaviorSubject({
    loading: true,
    options: { children: [], superclasses: [] },
    treeChildren: [],
    treeSuperclasses: [],
  }),
  predicates$: new BehaviorSubject({ loading: true, data: [], focusId: null }),
  // Shared interactive focus (the term selected in the hierarchy). Lives here so
  // selecting a node re-drives the hierarchy/predicate fetches without routing
  // the value back up through OverView's render.
  selectedValue$: new BehaviorSubject(null),
});

// Subscribe a component to a BehaviorSubject and re-render on its emissions.
export const useObservable = (subject) => {
  const [value, setValue] = useState(() => subject.getValue());
  useEffect(() => {
    setValue(subject.getValue());
    const sub = subject.subscribe(setValue);
    return () => sub.unsubscribe();
  }, [subject]);
  return value;
};
