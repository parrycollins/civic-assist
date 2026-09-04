export function ArchiveSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6" aria-hidden>
      <div className="skeleton h-40 rounded-[2rem]" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-28 rounded-[1.5rem]" />
        ))}
      </div>
      <div className="skeleton h-72 rounded-[1.8rem]" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="skeleton h-80 rounded-[1.6rem]" />
        <div className="skeleton h-80 rounded-[1.6rem]" />
      </div>
    </div>
  );
}
