import Link from "next/link";
import { cn } from "@/lib/utils";

export function AgencyCard({
  href,
  shortName,
  name,
  completed,
  verifiedShare,
  className,
}: {
  href: string;
  shortName: string;
  name: string;
  completed: number;
  verifiedShare: number;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("card-lift pressable block rounded-[1.6rem] bg-card p-5", className)}>
      <p className="text-xs font-bold tracking-[0.14em] text-gold uppercase">{shortName}</p>
      <p className="mt-1 font-heading text-lg font-extrabold">{name}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="font-heading text-2xl font-extrabold">{completed}</p>
          <p className="text-xs text-muted-foreground">Works completed</p>
        </div>
        <div>
          <p className="font-heading text-2xl font-extrabold">{verifiedShare}%</p>
          <p className="text-xs text-muted-foreground">Citizen verified</p>
        </div>
      </div>
    </Link>
  );
}
