/**
 * Returns a date string in YYYY-MM-DD format based on the local timezone.
 * This avoids issues where toISOString() returns the next day due to UTC conversion.
 */
export const getLocalDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Checks if a given date object represents "Today" in local time.
 */
export const isDateToday = (date: Date): boolean => {
  return getLocalDateKey(date) === getLocalDateKey(new Date());
};
