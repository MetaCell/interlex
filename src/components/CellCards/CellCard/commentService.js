import { getTermDiscussions } from "../../../api/endpoints/apiService";
import { addToTermDiscussion } from "../../../api/endpoints/swaggerMockMissingEndpoints";

/**
 * Comment thread access for the Cell Card's per-widget comment popover.
 *
 * Status of the backend, probed against uri.olympiangods.org: `/{group}/discussions/term/{id}`
 * answers **404 for every id**, including a valid `ilx_*` term — the discussions endpoint is not
 * deployed yet, independently of the npokb addressability gap. The existing Discussions tab
 * papers over this with a "work in progress" dialog and a mock API; this service instead calls
 * the real endpoint and reports failure, so the UI tells the truth and starts working the moment
 * the endpoint ships.
 *
 * Anonymous posting is intended (spec §10.6: commenting requires no login, unauthenticated
 * comments are attributed to "Anonymous"), so no auth gate is applied here. Whether the server
 * will accept an unauthenticated POST cannot be verified until the route exists.
 */

export const ANONYMOUS_AUTHOR = "Anonymous";

/**
 * The widget a comment was raised from. The typed `Discussion` model has no tag field, so the
 * context is carried as a prefix in the message body until one exists.
 */
export const withWidgetContext = (widgetTitle, cellLabel, body) => {
  const context = widgetTitle && cellLabel ? `[${widgetTitle}] ` : "";
  return `${context}${body}`.trim();
};

/** Prefilled text the popover opens with, matching the design's example wording. */
export const commentPlaceholder = (widgetTitle, cellLabel) =>
  widgetTitle && cellLabel ? `Commenting on the ${widgetTitle} of the cell ${cellLabel}.` : "";

export const fetchComments = async (group, termId) => {
  const data = await getTermDiscussions(group, termId);
  return Array.isArray(data) ? data : data?.discussions || [];
};

export const postComment = async ({ group, termId, body, widgetTitle, cellLabel, user }) => {
  const discussion = {
    message: withWidgetContext(widgetTitle, cellLabel, body),
    senderID: user?.id || user?.orcid || "anonymous",
    senderUserName: user?.username || user?.name || ANONYMOUS_AUTHOR,
    timestamp: new Date().toISOString(),
  };
  return addToTermDiscussion(group, termId, discussion);
};
