import { Role } from "./role";

interface RoleButtonProps {
  role: Role;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}

export default function RoleButton({
  role,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: RoleButtonProps) {
  const bgColor = role.used ? "bg-gray-300" : "bg-gray-100 hover:bg-gray-200";
  const cursor = role.used ? "cursor-default" : "cursor-pointer";
  const guardedOnClick = role.used ? undefined : onClick;
  const guardedOnMouseLeave = role.used ? undefined : onMouseLeave;
  return (
    <button
      key={role.id}
      className={`flex items-center gap-2 rounded border-1 ${bgColor} ${cursor}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={guardedOnMouseLeave}
      onClick={guardedOnClick}
    >
      <div
        className="h-4 w-4 rounded-full"
        style={{ backgroundColor: role.color }}
      ></div>
      <span>{role.id}</span>
    </button>
  );
}
