import { getInitials, getRandomColor } from "@/lib/utils";

interface AvatarProps {
  image?: string | null;
  name?: string | null;
  className?: string;
}

export function UserAvatar({ image, name, className = "w-9 h-9" }: AvatarProps) {
  const userName = name || "User";
  
  if (image) {
    return (
      <img
        src={image}
        alt={userName}
        className={`${className} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${className} rounded-full flex items-center justify-center text-white font-semibold text-sm ${getRandomColor(userName)}`}
    >
      {getInitials(userName)}
    </div>
  );
}