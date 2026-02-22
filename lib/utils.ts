/** Format an ISO date string as "Mon, Jan 1" */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** Format an ISO datetime string as "2:30 PM" */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Return the number of whole days between two ISO date strings */
export function daysBetween(a: string, b: string): number {
  const msPerDay = 86_400_000;
  const da = new Date(a);
  const db = new Date(b);
  return Math.round((db.getTime() - da.getTime()) / msPerDay);
}

/** Return a new ISO date string offset by `days` from the given date */
export function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}
