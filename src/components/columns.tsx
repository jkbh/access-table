import { createColumnHelper } from "@tanstack/react-table";
import { User } from "../data/user";

const columnHelper = createColumnHelper<User>();

// This function generates the columns for the table based a single user.
export function getColumns(groups: string[]) {
  const defaultColumns = [
    columnHelper.accessor("id", {
      header: "ID",
      meta: {
        stabilized: false,
      },
    }),
    columnHelper.accessor("name", {
      header: "Name",
      meta: {
        stabilized: false,
      },
    }),
  ];

  const groupColumns = groups.map((group) =>
    columnHelper.accessor((row) => row.groupStates[group] ?? "notAssigned", {
      id: group,
      header: () => <div style={{ writingMode: "sideways-lr" }}>{group}</div>,
      cell: (info) => (
        <div
          style={{
            minWidth: "2em",
            minHeight: "2em",
            backgroundColor:
              info.getValue() === "assigned" ? "lightgray" : "transparent",
            translate: "-0.4em",
          }}
        ></div>
      ),
    })
  );

  return [...defaultColumns, ...groupColumns];
}
