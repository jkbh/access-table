import { useEffect, useRef, useState } from "react";
import {
  makeUsers,
  User,
  AssignmentState,
  getGroupsSorted,
} from "../../data/user";
import { getColumns } from "./columns";
import {
  flexRender,
  getCoreRowModel,
  RowData,
  useReactTable,
} from "@tanstack/react-table";
import {
  calculateRoles,
  getRoleScore,
  removeRoleFromRoles,
  Role,
} from "./role";
import RoleButton from "./RoleButton";
import { RolesContext } from "./RolesContext";

// function to allow changed the original user state from inside the indivual cell renderers
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    updateAssigmentState: (
      rowIndex: number,
      columnId: string,
      value: AssignmentState,
    ) => void;
  }
}

export default function AccessTable() {
  const [users, setUsers] = useState<User[]>(makeUsers(10, 50));
  const [hoveredRole, setHoveredRole] = useState<Role | undefined>(undefined);
  const [roles, setRoles] = useState<Map<string, Role>>(calculateRoles(users));

  function recalculateRoles() {
    setRoles(() => calculateRoles(users));
    setUsers((prevUsers) => {
      return prevUsers.map((user) => {
        return { ...user, roles: [] };
      });
    });
    setHoveredRole(undefined);
    console.log("recalculating roles");
  }

  const groups = getGroupsSorted(users);
  const [columns, setColumns] = useState(getColumns(groups));

  const table = useReactTable({
    data: users,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnPinning: true,
    initialState: {
      columnPinning: {
        left: ["id", "name"],
      },
    },
    meta: {
      updateAssigmentState: (rowIndex, columnId, value) => {
        setUsers((old) => {
          const user = old[rowIndex];
          const newUser: User = {
            ...user,
            groupStates: { ...user.groupStates, [columnId]: value },
          };
          return [
            ...old.slice(0, rowIndex),
            newUser,
            ...old.slice(rowIndex + 1),
          ];
        });
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

  function pushRole(role: Role) {
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (role.users.includes(user.name)) {
          return {
            ...user,
            roles: [...user.roles, role.id],
          };
        }
        return user;
      }),
    );
    setRoles((r) => removeRoleFromRoles(role, r));
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex gap-1 overflow-x-auto">
        <button
          onClick={recalculateRoles}
          className="cursor-pointer rounded bg-blue-500 text-white hover:bg-blue-300"
        >
          Recalculate Roles
        </button>
        {Array.from(roles.values())
          .sort((a, b) => getRoleScore(b) - getRoleScore(a))
          .map((role) => (
            <RoleButton
              key={role.id}
              role={role}
              onClick={() => pushRole(role)}
              onMouseEnter={() => setHoveredRole(() => role)}
              onMouseLeave={() => setHoveredRole(undefined)}
            />
          ))}
      </div>
      <div className="h-full overflow-auto overscroll-none rounded-lg border border-gray-300 shadow-sm">
        <RolesContext.Provider value={{ roles, hoveredRole }}>
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
                      left: thRefs.current[i]
                        ? header.column.getStart() + i
                        : 0,
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
                        left: thRefs.current[i]
                          ? cell.column.getStart() + i
                          : 0,
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                  {row.getCenterVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="border-r border-b border-gray-300"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </RolesContext.Provider>
      </div>
    </div>
  );
}
