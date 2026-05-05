export async function submitVetFeedback(feedback) {
  return {
    ...feedback,
    submittedAt: new Date().toISOString(),
  };
}
