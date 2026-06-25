export const WEEKLY_CAPACITY_HOURS = 45;

export const WORKING_DAYS_PER_WEEK = 5;

export function calculateAvailableHours(
  plannedHours: number,
  weeklyCapacity: number = WEEKLY_CAPACITY_HOURS
) {
  return Math.max(weeklyCapacity - plannedHours, 0);
}

export function calculateLoad(
  plannedHours: number,
  weeklyCapacity: number = WEEKLY_CAPACITY_HOURS
) {
  if (weeklyCapacity <= 0) {
    return 0;
  }

  return Math.round((plannedHours / weeklyCapacity) * 100);
}

export function calculateDailyCapacityHours(
  weeklyCapacity: number = WEEKLY_CAPACITY_HOURS
) {
  return weeklyCapacity / WORKING_DAYS_PER_WEEK;
}
