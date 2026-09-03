import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="font-heading text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        That CivicGH page does not exist. Head back to the civic map.
      </p>
      <Link href="/map" className="mt-4 inline-block text-sm font-medium text-primary">
        Open the map
      </Link>
    </div>
  );
}
