import { Subject } from "rxjs";

// Cross-cutting channel for surfacing failed backend requests to the UI. API
// callers report failures here; a single dialog subscribes and shows the
// queried URL plus the error returned by the backend.
const apiError$$ = new Subject();

export const reportApiError = (error) => apiError$$.next(error);

export const apiError$ = apiError$$.asObservable();
