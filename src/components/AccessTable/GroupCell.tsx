import { memo } from "react";
import { tableStore } from "./store";

const GroupCell = memo(function GroupCell({
  userKey,
  group,
}: {
  userKey: string;
  group: string;
}) {
  const user = tableStore((state) => state.users[userKey]);
  const setUser = tableStore((state) => state.setUser);
  const hoveredRoleKey = tableStore((state) => state.hoveredRole);
  const primaryRole = user.roles
    .map((key) => tableStore.getState().roles[key])
    .find((role) => role.groups.includes(group));
  let hoveredRole =
    hoveredRoleKey && tableStore.getState().roles[hoveredRoleKey]!;
  if (hoveredRole === "") {
    hoveredRole = undefined;
  }
  console.log(hoveredRole);
  const state = user.groupStates[group];
  const backgroundColor = (() => {
    switch (state) {
      case "assigned":
        return "bg-gray-500";
      case "assumed":
        return "bg-gray-400";
      default:
        return "bg-transparent";
    }
  })();

  const localHoveredRole =
    hoveredRole?.groups.includes(group) && hoveredRole.users.includes(user.id)
      ? hoveredRole
      : undefined;

  const roleColor = primaryRole?.color || localHoveredRole?.color || undefined;

  const cursor = state !== "assigned" ? "cursor-pointer" : "cursor-default";

  function onClick() {
    const nextValue = state === "assumed" ? "notAssigned" : "assumed";
    setUser(userKey, (prevUser) => ({
      ...prevUser,
      groupStates: { ...prevUser.groupStates, [group]: nextValue },
    }));
  }

  return (
    <div
      className={`min-h-8 min-w-8 ${backgroundColor} ${cursor}`}
      style={roleColor ? { backgroundColor: roleColor } : {}}
      onClick={state !== "assigned" ? onClick : undefined}
    ></div>
  );
});

export default GroupCell;
