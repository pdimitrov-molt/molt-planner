export function getElapsedSeconds(
  startedAt: string,
  referenceDate: Date = new Date()
): number {
  return Math.max(
    0,
    Math.floor((referenceDate.getTime() - Date.parse(startedAt)) / 1000)
  );
}

export function formatElapsedDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}
