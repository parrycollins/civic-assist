import { formatDistanceToNow, parseISO } from "date-fns";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function formatDate(iso: string) {
  const d = parseISO(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatShortDate(iso: string) {
  const d = parseISO(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

export function formatDateTime(iso: string) {
  const d = parseISO(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}, ${pad(
    d.getUTCHours(),
  )}:${pad(d.getUTCMinutes())}`;
}

export function fromNow(iso: string) {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true });
}

export function daysBetween(from: string, to: string) {
  const a = parseISO(from).getTime();
  const b = parseISO(to).getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
}
