export function formatProjectNumber(year: number, sequence: number): string {
  const yearSuffix = String(year).slice(-2);
  return `${yearSuffix}${String(sequence).padStart(3, "0")}`;
}

export function parseProjectNumberYear(projectNumber: string): number | null {
  if (projectNumber.length < 2) {
    return null;
  }

  const yearSuffix = Number.parseInt(projectNumber.slice(0, 2), 10);

  if (Number.isNaN(yearSuffix)) {
    return null;
  }

  return 2000 + yearSuffix;
}
