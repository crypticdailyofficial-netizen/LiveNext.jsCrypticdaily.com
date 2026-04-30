import Image from "next/image";
import { cn } from "@/lib/utils";

interface AuthorAvatarProps {
  name: string;
  src?: string | null;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
}

function getInitials(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "CD";
}

export function AuthorAvatar({
  name,
  src,
  className,
  imageClassName,
  fallbackClassName,
}: AuthorAvatarProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full bg-[linear-gradient(135deg,#172033,#0F172A)]",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes="48px"
          className={cn("object-cover", imageClassName)}
        />
      ) : (
        <span
          className={cn(
            "flex h-full w-full items-center justify-center font-semibold text-[#F9FAFB]",
            fallbackClassName,
          )}
          aria-hidden="true"
        >
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}
