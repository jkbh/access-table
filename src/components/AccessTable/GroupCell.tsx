import { CellContext } from "@tanstack/react-table";
import { useState } from "react";
import { User, AssignmentState } from "../../data/user";

export default function GroupCell({
  getValue,
  row: { index },
  column: { id },
  table,
}: CellContext<User, AssignmentState>) {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);

  function onClick() {
    setValue((prev) => (prev === "assumed" ? "notAssigned" : "assumed"));
    // TODO: update the value in the table aswell
  }

  const backgroundColor = (() => {
    switch (value) {
      case "assigned":
        return "bg-gray-500";
      case "assumed":
        return "bg-gray-400";
      default:
        return "bg-transparent";
    }
  })();

  const cursor =
    initialValue !== "assigned" ? "cursor-pointer" : "cursor-default";

  return (
    <div
      className={`min-h-8 min-w-8 ${backgroundColor} ${cursor}`}
      onClick={initialValue !== "assigned" ? onClick : undefined}
    ></div>
  );
}
