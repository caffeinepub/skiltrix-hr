export function timeToDate(time: bigint): Date {
  return new Date(Number(time / 1_000_000n));
}

export function dateToTime(date: Date): bigint {
  return BigInt(date.getTime()) * 1_000_000n;
}

export function nowTime(): bigint {
  return BigInt(Date.now()) * 1_000_000n;
}

export function formatDate(time: bigint): string {
  return timeToDate(time).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateInput(time: bigint): string {
  const d = timeToDate(time);
  return d.toISOString().split("T")[0];
}

export function parseDateInput(val: string): bigint {
  return dateToTime(new Date(val));
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function monthName(month: bigint): string {
  return MONTHS[Number(month) - 1] ?? String(month);
}
