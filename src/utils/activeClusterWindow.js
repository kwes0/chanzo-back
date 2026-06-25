const DAY_IN_MS = 24 * 60 * 60 * 1000;
const KENYA_UTC_OFFSET_IN_MINS = 3 * 60;

const getKenyaDateParts = (date) => {
  const offsetInMs = KENYA_UTC_OFFSET_IN_MINS * 60 * 1000;
  const kenyaDate = new Date(date.getTime() + offsetInMs);

  return {
    year: kenyaDate.getFullYear(),
    month: kenyaDate.getMonth(),
    date: kenyaDate.getDate(),
    day: kenyaDate.getDay(), //Sunday - 0 and Monday - 1 and Sato - 6
    offsetInMs,
  };
};

const KenyaMidnighttoUTC = (year, month, date, offsetInMs) => {
  return new Date(Date.UTC(year, month, date) - offsetInMs);
};

const getActiveClusterWindow = (now = new Date()) => {
  const { year, month, date, day, offsetInMs } = getKenyaDateParts(now);

  const daysSinceMonday = day === 0 ? 6 : day - 1;
  const startOfToday = KenyaMidnighttoUTC(year, month, date, offsetInMs);
  const startOfWeek = new Date(
    startOfToday.getTime() - daysSinceMonday * DAY_IN_MS,
  );
  const startOfMonth = KenyaMidnighttoUTC(year, month, 1, offsetInMs);

  const startOfNextWeek = new Date(startOfWeek.getTime() + 7 * DAY_IN_MS);
  const startOfNextMonth = KenyaMidnighttoUTC(year, month + 1, 1, offsetInMs);

  return {
    start: new Date(Math.max(startOfWeek, startOfMonth)),
    end: new Date(Math.min(startOfNextWeek, startOfNextMonth)),
  };
};

export { getActiveClusterWindow };
