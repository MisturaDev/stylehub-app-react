import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  compact?: boolean;
};

export function BrandLogo({
  className,
  markClassName,
  textClassName,
  compact = false,
}: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full overflow-hidden",
          markClassName
        )}
        aria-hidden="true"
      >
        <img src="/stylehub-logo.svg" alt="" className="h-full w-full object-cover" />
      </span>
      {!compact && (
        <span className={cn("font-serif text-2xl font-bold leading-none", textClassName)}>
          Style Hub
        </span>
      )}
    </span>
  );
}
