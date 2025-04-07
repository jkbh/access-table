import { useEffect, useRef, useState } from "react";
import { makeUsers, getGroupsSorted } from "../../data/user";
import { getColumns } from "./columns";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { calculateRoles } from "./role";
import RoleButton from "./RoleButton";
import { tableStore } from "./store";
import { useShallow } from "zustand/react/shallow";

// set initial state, this should be a user event later. Maybe a dropzone for a users.json file
const data = makeUsers(10, 60);
const groups = getGroupsSorted(data);
tableStore.getState().setUsers(data);
tableStore.setState((state) => ({
  ...state,
  groups,
}));

export default function AccessTable() {
  const setRoles = tableStore((state) => state.setRoles);
  const setHoveredRole = tableStore((state) => state.setHoveredRole);
  const userKeys = tableStore(useShallow((state) => Object.keys(state.users)));
  const roleKeys = tableStore(useShallow((state) => Object.keys(state.roles)));
  const setUser = tableStore((state) => state.setUser);

  function recalculateRoles() {
    setRoles(Array.from(calculateRoles(userKeys).values()));
    userKeys.forEach((key) => {
      setUser(key, (user) => {
        return { ...user, roles: [] };
      });
    });
    setHoveredRole(undefined);
  }

  const [columns, setColumns] = useState(getColumns(groups));

  const table = useReactTable({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnPinning: true,
    initialState: {
      columnPinning: {
        left: ["id", "name"],
      },
    },
  });

  // setup references to cells to fetch rendered width
  const thRefs = useRef<HTMLTableCellElement[]>([]); // corrected type

  // update columns sizes in the tanstack table state after the table has rendered
  useEffect(() => {
    const sizes = thRefs.current.map((ref) => ref?.clientWidth);
    setColumns((prevColumns) =>
      prevColumns.slice().map((col, i) => ({ ...col, size: sizes[i] })),
    );
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex gap-1 overflow-x-auto">
        <button
          onClick={recalculateRoles}
          className="cursor-pointer rounded bg-blue-500 text-white hover:bg-blue-300"
        >
          Recalculate Roles
        </button>
        {Array.from(roleKeys).map((role) => (
          <RoleButton key={role} roleKey={role} />
        ))}
      </div>
      <div className="h-full overflow-auto overscroll-none rounded-lg border border-gray-300 shadow-sm">
        <table className="border-separate border-spacing-0 whitespace-nowrap">
          <thead>
            <tr className="align-bottom">
              {table.getLeftLeafHeaders().map((header, i) => (
                <th
                  ref={(node) => {
                    thRefs.current[i] = node!;
                  }} // store the ref in the array
                  key={header.id}
                  className="sticky top-0 z-30 border-r border-b border-gray-300 bg-white text-left"
                  style={{
                    left: thRefs.current[i] ? header.column.getStart() + i : 0,
                  }}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
              {table.getCenterLeafHeaders().map((header, i) => (
                <th
                  ref={(node) => {
                    thRefs.current[i + table.getLeftLeafHeaders().length] =
                      node!;
                  }} // offset index to skip pinned column refs
                  key={header.id}
                  className="sticky top-0 z-20 border-r border-b border-gray-300 bg-white"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getLeftVisibleCells().map((cell, i) => (
                  <td
                    key={cell.id}
                    className="sticky z-10 border-r border-b border-gray-300 bg-white"
                    style={{
                      left: thRefs.current[i] ? cell.column.getStart() + i : 0,
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                {row.getCenterVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="border-r border-b border-gray-300"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
