import { useState } from "react";

interface ProfileAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: "small" | "large";
}

const fallbackColors = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-cyan-100 text-cyan-700",
] as const;

function initialsFor(name: string): string {
  const nameParts = name.trim().split(/\s+/).filter(Boolean);

  if (nameParts.length === 0) {
    return "?";
  }

  const firstInitial = nameParts[0].charAt(0);
  const lastInitial =
    nameParts.length > 1 ? nameParts[nameParts.length - 1].charAt(0) : "";

  return `${firstInitial}${lastInitial}`.toLocaleUpperCase("de-DE");
}

function colorFor(name: string): (typeof fallbackColors)[number] {
  const hash = Array.from(name).reduce(
    (current, character) => current + character.codePointAt(0)!,
    0,
  );

  return fallbackColors[hash % fallbackColors.length];
}

export function ProfileAvatar({
  name,
  avatarUrl,
  size = "small",
}: ProfileAvatarProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = Boolean(avatarUrl && avatarUrl !== failedUrl);
  const sizeClasses =
    size === "large"
      ? "h-20 w-20 rounded-3xl border-4 border-white/30 text-xl shadow-lg"
      : "h-9 w-9 rounded-full text-sm";

  if (showImage) {
    return (
      <img
        src={avatarUrl}
        alt=""
        aria-hidden="true"
        onError={() => setFailedUrl(avatarUrl ?? null)}
        className={`${sizeClasses} shrink-0 object-cover`}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`${sizeClasses} ${colorFor(name)} flex shrink-0 items-center justify-center font-extrabold`}
    >
      {initialsFor(name)}
    </div>
  );
}
