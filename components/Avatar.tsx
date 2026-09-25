import Image from "next/image";
import type { Roommate } from "@/lib/roommates";

interface AvatarProps {
  roommate: Roommate;
  size: number;
  className?: string;
  bare?: boolean;
}

export default function Avatar({ roommate, size, className = "", bare = false }: AvatarProps) {
  return (
    <Image
      src={roommate.avatar}
      alt={`${roommate.name}'s avatar`}
      width={size}
      height={size}
      unoptimized
      className={`rounded-full ${roommate.theme.soft} ${bare ? "" : `ring-2 ${roommate.theme.ring}`} ${className}`}
    />
  );
}
