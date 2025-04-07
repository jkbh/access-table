import { CellContext } from "@tanstack/react-table";
import { useContext, useState } from "react";
import { User, AssignmentState } from "../../data/user";
import { RolesContext } from ".";

export default function GroupCell({
  getValue,
  row,
  column: { id },
  table,
}: CellContext<User, AssignmentState>) {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);

  let backgroundColor = (() => {
    switch (value) {
      case "assigned":
        return "bg-gray-500";
      case "assumed":
        return "bg-gray-400";
      default:
        return "bg-transparent";
    }
  })();

  function onClick() {
    const nextValue = value === "assumed" ? "notAssigned" : "assumed";
    setValue(nextValue);
    // TODO: update the value in the table aswell
    table.options.meta?.updateAssigmentState(row.index, id, nextValue);
  }

  const rolesContext = useContext(RolesContext);

  const primaryRole = Array.from(rolesContext.roles.values()).find(
    (role) => role.groups.includes(id) && row.original.roles.includes(role.id),
  );

  const hoveredRole =
    rolesContext.hoveredRole?.groups.includes(id) &&
    rolesContext.hoveredRole.users.includes(row.original.name)
      ? rolesContext.hoveredRole
      : null;

  const roleColor = primaryRole?.color || hoveredRole?.color || undefined;
  console.log(primaryRole);
  console.log(hoveredRole);
  const cursor =
    initialValue !== "assigned" ? "cursor-pointer" : "cursor-default";

  return (
    <div
      className={`min-h-8 min-w-8 ${backgroundColor} ${cursor}`}
      style={roleColor ? { backgroundColor: roleColor } : {}}
      onClick={initialValue !== "assigned" ? onClick : undefined}
    ></div>
  );
}
