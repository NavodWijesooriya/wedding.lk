import Link from "next/link";
import { Lotus } from "@/components/site/ornaments";

export function Brand({ href = "/", light = false }: { href?: string; light?: boolean }) {
  return (
    <Link href={href} className={`inline-flex items-center gap-2 ${light ? "text-white" : "text-maroon-600"}`} aria-label="Wedding.lk home">
      <Lotus className="h-7 w-10 text-gold-500" />
      <span className="font-display text-[1.65rem] font-bold leading-none tracking-tight">Wedding<span className="text-gold-500">.lk</span></span>
    </Link>
  );
}
