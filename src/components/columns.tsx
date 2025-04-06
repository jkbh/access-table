import { createColumnHelper } from "@tanstack/react-table";
import { User } from "../data/user";

const columnHelper = createColumnHelper<User>();

// This function generates the columns for the table based a single user.
export function getColumns(groups: string[]) {
  const defaultColumns = [
    columnHelper.accessor("id", {
      header: "ID",
    }),
    columnHelper.accessor("name", {
      header: "Name",
    }),
  ];

  const groupColumns = groups.map((group) =>
    columnHelper.accessor((row) => row.groupStates[group] ?? "notAssigned", {
      id: group,
      header: () => (
        <div className="w-mode-sideways-lr translate-x-1">{group}</div>
      ),
      cell: (info) => (
        <div
          className={`min-h-8 min-w-8 ${info.getValue() === "assigned" ? "bg-gray-500" : "bg-gray-100"}`}
        ></div>
      ),
    }),
  );

  return [...defaultColumns, ...groupColumns];
}
