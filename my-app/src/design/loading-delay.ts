/** Feedback is delayed; the content itself is never delayed. */
export function scheduleLoadingFeedback(reveal: () => void): () => void {
  const timer = setTimeout(reveal, 500);
  return () => clearTimeout(timer);
}
