import { createColumnHelper } from "@tanstack/react-table";
import { User } from "../data/user";

const columnHelper = createColumnHelper<User>();

// This function generates the columns for the table based a single user.
export function getColumns(groups: string[]) {
  const defaultColumns = [
    columnHelper.accessor("id", {
      header: () => <div className="px-2">ID</div>,
      cell: (info) => <div className="px-2">{info.getValue()}</div>,
    }),
    columnHelper.accessor("name", {
      header: () => <div className="px-2">Name</div>,
      cell: (info) => <div className="px-2">{info.getValue()}</div>,
    }),
  ];

  const groupColumns = groups.map((group) =>
    columnHelper.accessor((row) => row.groupStates[group] ?? "notAssigned", {
      id: group,
      header: () => (
        <div className="w-mode-sideways-lr translate-x-1 pb-2">{group}</div>
      ),
      cell: (info) => (
        <div
          className={`min-h-8 min-w-8 ${info.getValue() === "assigned" ? "bg-gray-500" : "bg-transparent"}`}
        ></div>
      ),
    }),
  );

  return [...defaultColumns, ...groupColumns];
}
