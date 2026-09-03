import { ErrorState } from "@/components/ui-kit/ErrorState";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <ErrorState
        title="Something went wrong"
        body="We couldn't find that CivicGH page."
        actionHref="/map"
        actionLabel="Open the civic map"
      />
    </div>
  );
}
