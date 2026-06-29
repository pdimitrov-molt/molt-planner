export function calculateWaitingDurationMinutes(input: {
  started_at: string;
  ended_at: string | null;
}): number | null {
  if (!input.ended_at) {
    return null;
  }

  const startedAt = Date.parse(input.started_at);
  const endedAt = Date.parse(input.ended_at);

  if (Number.isNaN(startedAt) || Number.isNaN(endedAt)) {
    return null;
  }

  return Math.max(0, Math.round((endedAt - startedAt) / 60_000));
}
