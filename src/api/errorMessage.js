// The backend answers failures with a small HTML page whose <title> and <h1> only restate the
// status; the reason sits in its <p>. Parsed rather than regex-stripped so every entity decodes.
export const readableErrorMessage = (raw) => {
  const text = String(raw ?? "");
  if (!/<[a-z!/][^>]*>/i.test(text)) return text.trim();

  const doc = new DOMParser().parseFromString(text, "text/html");
  const reason = doc.querySelector("p")?.textContent || doc.body?.textContent || "";
  return reason.replace(/\s+/g, " ").trim();
};
