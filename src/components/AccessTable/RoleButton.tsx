import { useShallow } from "zustand/shallow";
import { tableStore } from "./store";

interface RoleButtonProps {
  roleKey: string;
  // onMouseEnter?: () => void;
  // onMouseLeave?: () => void;
  // onClick?: () => void;
}

export default function RoleButton({
  roleKey,
  // onMouseEnter,
  // onMouseLeave,
  // onClick,
}: RoleButtonProps) {
  const role = tableStore((state) => state.roles[roleKey]);
  const setHoveredRole = tableStore((state) => state.setHoveredRole);
  const setUser = tableStore((state) => state.setUser);
  const setRole = tableStore((state) => state.setRole);
  const roleKeys = tableStore(useShallow((state) => Object.keys(state.roles)));

  const bgColor = role.used ? "bg-gray-300" : "bg-gray-100 hover:bg-gray-200";
  const cursor = role.used ? "cursor-default" : "cursor-pointer";
  const guardedOnMouseEnter = role.used
    ? undefined
    : () => setHoveredRole(role.id);
  const guardedOnClick = role.used ? undefined : () => pushRole();
  const guardedOnMouseLeave = role.used
    ? undefined
    : () => setHoveredRole(undefined);

  function pushRole() {
    // add role to permitted users
    role.users.forEach((userKey) => {
      console.log(userKey);
      setUser(userKey, (prevUser) => {
        return {
          ...prevUser,
          roles: [...prevUser.roles, role.id],
        };
      });
    });
    // remove role groups from remaining roles
    roleKeys.forEach((key) => {
      if (key !== role.id) {
        setRole(key, (prevRole) => {
          return {
            ...prevRole,
            groups: prevRole.groups.filter(
              (group) => !role.groups.includes(group),
            ),
          };
        });
      }
    });
    setRole(roleKey, (prevRole) => ({ ...prevRole, used: true }));
    setHoveredRole(undefined);
  }
  return (
    <button
      key={role.id}
      className={`flex items-center gap-2 rounded border-1 ${bgColor} ${cursor}`}
      onMouseEnter={guardedOnMouseEnter}
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
