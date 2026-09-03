import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatDate(iso: string) {
  return format(parseISO(iso), "d MMM yyyy");
}

export function formatShortDate(iso: string) {
  return format(parseISO(iso), "d MMM");
}

export function formatDateTime(iso: string) {
  return format(parseISO(iso), "d MMM yyyy, HH:mm");
}

export function fromNow(iso: string) {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true });
}

export function daysBetween(from: string, to: string) {
  const a = parseISO(from).getTime();
  const b = parseISO(to).getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
}
