export function getWeekRanges() {
  const now = new Date();

  // Start of current week (Sunday 00:00:00)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  // End of current week (Saturday 23:59:59)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  endOfWeek.setHours(23, 59, 59, 999);

  // Start of last week
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  // End of last week (start of current week)
  const endOfLastWeek = new Date(startOfWeek);

  return {
    currentWeek: { start: startOfWeek, end: endOfWeek },
    lastWeek: { start: startOfLastWeek, end: endOfLastWeek },
  };
}
